<template>
  <div class="tt-stack">
    <div class="tt-field">
      <label class="tt-label" for="tt-line">Lines</label>
      <div class="tt-chips">
        <span
          v-for="(line, index) in lines"
          :key="conditionText(line)"
          class="tt-chip text"
        >
          <span
            class="tt-sw"
            :style="{ background: colours[index % colours.length] }"
            aria-hidden="true"
          />
          <span v-if="line.kind !== 'pokemon'" class="kind">{{
            kindLabels[line.kind]
          }}</span>
          {{ line.name }}
          <button
            type="button"
            :aria-label="`Remove ${line.name}`"
            @click="remove(index)"
          >
            ×
          </button>
        </span>
      </div>
      <SuggestInput
        id="tt-line"
        placeholder="Add a Pokémon, move, item, ability or Tera type"
        :options="options"
        @pick="add"
      />
    </div>
    <div v-if="timeline.months.length < 2" class="tt-note">
      Too few months with at least {{ least }} Teams to draw a line. Widen the
      search to see usage over time.
    </div>
    <template v-else>
      <div class="tt-sheet" style="padding: 10px">
        <UsageChart
          :timeline="timeline"
          :label="`Usage per month of ${timeline.lines.map((line) => line.label).join(', ')}`"
        />
      </div>
      <div class="tt-line">
        <button type="button" class="tt-btn" @click="downloadCsv">
          Download CSV
        </button>
        <span class="tt-muted tt-small"
          >Share of the Teams of each month that have the entry; months with
          fewer than {{ least }} Teams are left out.</span
        >
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { saveAs } from "file-saver";
import {
  conditionText,
  kindLabels,
  sameCondition,
  type Condition,
} from "@/tournament/filter";
import { lineColours as colours } from "@/tournament/lineColours";
import type { GameSide, TokenKind } from "@/tournament/model";
import { usageOverTime, vocabularyOf } from "@/tournament/statistics";
import {
  conditionSuggestions,
  type Suggestion,
} from "@/tournament/suggestions";

const properties = defineProps<{ sides: GameSide[] }>();

const least = 10;
const startWith = 5;

const vocabulary = computed(() => vocabularyOf(properties.sides));

/** The lines someone chose; until then, the most used Pokémon of the search. */
const chosen = ref<Condition[] | null>(null);
const lines = computed<Condition[]>(
  () =>
    chosen.value ??
    [...vocabulary.value.pokemon.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, startWith)
      .map(([name]) => ({ kind: "pokemon", name, exclude: false })),
);

const options = (text: string) => conditionSuggestions(vocabulary.value, text);
const add = (suggestion: Suggestion) => {
  const line: Condition = {
    kind: suggestion.kind as TokenKind,
    name: suggestion.value,
    exclude: false,
  };
  if (!lines.value.some((entry) => sameCondition(entry, line))) {
    chosen.value = [...lines.value, line];
  }
};
const remove = (index: number) => {
  chosen.value = lines.value.filter((_, position) => position !== index);
};

const labelOf = (condition: Condition) =>
  condition.kind === "pokemon"
    ? condition.name
    : `${kindLabels[condition.kind]}: ${condition.name}`;

const timeline = computed(() =>
  usageOverTime(properties.sides, lines.value, labelOf, least),
);

const downloadCsv = () => {
  const header = [
    "Month",
    "Teams",
    ...timeline.value.lines.map((line) => line.label),
  ];
  const rows = timeline.value.months.map((month, index) =>
    [
      month,
      timeline.value.totals[index],
      ...timeline.value.lines.map(
        (line) => `${(line.shares[index] * 100).toFixed(2)}%`,
      ),
    ].join(";"),
  );
  saveAs(
    new Blob([[header.join(";"), ...rows].join("\n")], {
      type: "text/csv;charset=utf-8",
    }),
    "usage_over_time.csv",
  );
};
</script>
