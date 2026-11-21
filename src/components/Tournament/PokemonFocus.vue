<template>
  <div class="tt-stack">
    <div v-if="!inline" class="tt-line">
      <IconRenderer :name="name" />
      <h3 style="font-size: 18px">{{ name }}</h3>
    </div>
    <div class="tt-small tt-muted">
      On {{ formatCount(detail.use) }} Teams ({{ percent(detail.use, total) }}),
      won {{ percent(detail.wins, detail.decided) }} of their Games.
    </div>
    <div v-if="timeline.months.length > 1" style="max-width: 420px">
      <div class="tt-label">Usage per month</div>
      <svg
        viewBox="0 0 300 70"
        role="img"
        :aria-label="`Usage of ${name} per month, from ${timeline.months[0]} to ${timeline.months.at(-1)}`"
        style="width: 100%; height: auto; display: block"
      >
        <polyline
          :points="sparkline"
          fill="none"
          stroke="var(--tt-accent)"
          stroke-width="2"
          stroke-linejoin="round"
        />
      </svg>
      <div
        class="tt-small tt-muted"
        style="display: flex; justify-content: space-between"
      >
        <span>{{ timeline.months[0] }}</span>
        <span>peak {{ (peak * 100).toFixed(0) }}%</span>
        <span>{{ timeline.months.at(-1) }}</span>
      </div>
    </div>
    <div class="tt-detailgrid">
      <div
        v-for="block in blocks.filter((entry) => entry.rows.length > 0)"
        :key="block.title"
        class="tt-kv"
      >
        <div class="tt-label">{{ block.title }}</div>
        <div v-for="row in block.rows" :key="row.key">
          <button
            v-if="block.conditions"
            type="button"
            class="tt-rowname"
            :title="`Show the Matches with ${row.key} on ${name}`"
            @click="
              emit(
                'require',
                block.conditions(row.key),
                `${name} with ${row.key}`,
              )
            "
          >
            {{ row.key }}
          </button>
          <span v-else>{{ row.key }}</span>
          <span class="tt-muted">{{ percent(row.use, detail.use) }}</span>
        </div>
      </div>
    </div>
    <div v-if="matchups.length >= 2" class="tt-two">
      <div class="tt-kv">
        <div class="tt-label">Does well against</div>
        <div v-for="row in matchups.slice(0, 4)" :key="row.key">
          <span class="tt-line" style="gap: 4px"
            ><IconRenderer :name="row.key" />{{ row.key }}</span
          >
          <span class="tt-wr good">{{ percent(row.wins, row.decided) }}</span>
        </div>
      </div>
      <div class="tt-kv">
        <div class="tt-label">Struggles against</div>
        <div v-for="row in matchups.slice(-4).toReversed()" :key="row.key">
          <span class="tt-line" style="gap: 4px"
            ><IconRenderer :name="row.key" />{{ row.key }}</span
          >
          <span class="tt-wr bad">{{ percent(row.wins, row.decided) }}</span>
        </div>
      </div>
    </div>
    <div>
      <button
        type="button"
        class="tt-btn primary"
        @click="
          emit('require', [{ kind: 'pokemon', name, exclude: false }], name)
        "
      >
        Show its Matches →
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Condition } from "@/tournament/filter";
import { formatCount, type GameSide } from "@/tournament/model";
import {
  pokemonDetail,
  share,
  usageOverTime,
  type Row,
} from "@/tournament/statistics";

const properties = withDefaults(
  defineProps<{
    name: string;
    sides: GameSide[];
    /** Inside a table row: without the heading. */
    inline?: boolean;
  }>(),
  { inline: false },
);

const emit = defineEmits<{
  /** Asks for the Matches of Teams that meet the Conditions; `about` says what they describe. */
  require: [conditions: Condition[], about: string];
}>();

const percent = (part: number, whole: number) => {
  const value = share(part, whole) * 100;
  return `${value >= 10 ? value.toFixed(0) : value.toFixed(1)}%`;
};

const detail = computed(() => pokemonDetail(properties.name, properties.sides));
const total = computed(
  () => properties.sides.filter((side) => side.team !== null).length,
);

const timeline = computed(() =>
  usageOverTime(
    properties.sides,
    [{ kind: "pokemon", name: properties.name, exclude: false }],
    (condition) => condition.name,
  ),
);
const peak = computed(() => Math.max(0.01, ...timeline.value.lines[0].shares));
const sparkline = computed(() => {
  const shares = timeline.value.lines[0].shares;
  return shares
    .map((value, index) => {
      const x = (index / Math.max(shares.length - 1, 1)) * 296 + 2;
      const y = 66 - (value / peak.value) * 62;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
});

const on = (kind: Condition["kind"]) => (value: string) => [
  { kind, name: value, on: properties.name, exclude: false } as Condition,
];

const blocks = computed<
  { title: string; rows: Row[]; conditions?: (key: string) => Condition[] }[]
>(() => [
  {
    title: "Items",
    rows: detail.value.items.rows.slice(0, 6),
    conditions: on("item"),
  },
  {
    title: "Moves",
    rows: detail.value.moves.rows.slice(0, 8),
    conditions: on("move"),
  },
  {
    title: "Tera types",
    rows: detail.value.teras.rows.slice(0, 6),
    conditions: on("tera"),
  },
  {
    title: "Abilities",
    rows: detail.value.abilities.rows.slice(0, 4),
    conditions: on("ability"),
  },
  {
    title: "Teammates",
    rows: detail.value.teammates.rows.slice(0, 8),
    conditions: (key) => [
      { kind: "pokemon", name: properties.name, exclude: false },
      { kind: "pokemon", name: key, exclude: false },
    ],
  },
]);

/** The Pokémon met often enough to say something, best win rate first. */
const matchups = computed(() =>
  detail.value.opponents.rows
    .filter((row) => row.decided >= 8)
    .sort((a, b) => share(b.wins, b.decided) - share(a.wins, a.decided)),
);
</script>
