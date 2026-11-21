<template>
  <div v-if="present.length === 0" class="tt-note">
    No Teams in this search.
  </div>
  <div v-else class="tt-stack">
    <div v-if="present.length > 1" class="tt-field">
      <span class="tt-label">Stats for</span>
      <div class="tt-chips">
        <button
          v-for="entry in present"
          :key="entry"
          type="button"
          class="tt-chip text"
          :class="{ on: entry === shownFormat }"
          :aria-pressed="entry === shownFormat"
          @click="emit('update:format', entry)"
        >
          {{ formatName(entry) }}
        </button>
      </div>
      <span class="tt-muted tt-small"
        >Stats show one Format at a time, so that Formats do not mix. Matches,
        Teams and Tournaments show all chosen Formats together.</span
      >
    </div>
    <div>
      <div class="tt-seg" role="group" aria-label="Statistics">
        <button
          v-for="entry in tables"
          :key="entry.id"
          type="button"
          :class="{ on: entry.id === shownTable }"
          @click="emit('update:table', entry.id)"
        >
          {{ entry.title }}
        </button>
      </div>
    </div>
    <StatsOverview
      v-if="shownTable === 'overview'"
      :sides="shownSides"
      @require="(conditions, about) => emit('require', conditions, about)"
    />
    <UsageOverTime v-else-if="shownTable === 'time'" :sides="shownSides" />
    <StatsTable
      v-else
      :key="shownTable"
      :sides="shownSides"
      :kind="shownTable"
      @require="(conditions, about) => emit('require', conditions, about)"
    />
  </div>
</template>

<script setup lang="ts">
import type { Condition } from "@/tournament/filter";
import type { GameSide } from "@/tournament/model";
import { tableKinds } from "@/tournament/statistics";

const properties = withDefaults(
  defineProps<{
    /** The sides of a search, of one Format or several. */
    sides: GameSide[];
    /** The Format to show when the sides span several; the one with the most Teams by default. */
    format?: string | null;
    /** The id of the statistic to show. */
    table?: string;
    formatName: (id: string) => string;
  }>(),
  { format: null, table: "overview" },
);

const emit = defineEmits<{
  "update:format": [value: string];
  "update:table": [value: string];
  /** Asks for the Matches of Teams that meet the Conditions; `about` says what they describe. */
  require: [conditions: Condition[], about: string];
}>();

const kind = (id: string) => {
  const entry = tableKinds.find((candidate) => candidate.id === id)!;
  return { id: entry.id, title: entry.title };
};

const tables = [
  { id: "overview", title: "Overview" },
  kind("pokemon"),
  { id: "combos", title: "Combos" },
  kind("leads"),
  kind("items"),
  kind("items-by-pokemon"),
  kind("moves"),
  kind("moves-by-pokemon"),
  kind("tera"),
  { id: "time", title: "Usage over time" },
];

/** The Formats of the sides, the one with the most Teams first. */
const present = computed(() => {
  const counts = new Map<string, number>();
  for (const side of properties.sides) {
    if (side.team !== null) {
      counts.set(side.game.format, (counts.get(side.game.format) ?? 0) + 1);
    }
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([id]) => id);
});
const shownFormat = computed(() =>
  properties.format !== null && present.value.includes(properties.format)
    ? properties.format
    : present.value[0],
);
const shownSides = computed(() =>
  present.value.length > 1
    ? properties.sides.filter((side) => side.game.format === shownFormat.value)
    : properties.sides,
);
const shownTable = computed(() =>
  tables.some((entry) => entry.id === properties.table)
    ? properties.table
    : "overview",
);
</script>
