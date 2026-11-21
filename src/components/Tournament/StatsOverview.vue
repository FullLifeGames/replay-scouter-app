<template>
  <div v-if="focused === null" class="tt-note">No Teams in this search.</div>
  <div v-else class="tt-stack" style="gap: 14px">
    <div class="tt-kpis">
      <div v-for="[name, value] in figures" :key="name" class="tt-card tt-kpi">
        <span class="tt-label">{{ name }}</span>
        <b>{{ value }}</b>
      </div>
    </div>
    <div class="tt-overview">
      <section class="tt-stack" style="gap: 10px; min-width: 0">
        <div class="tt-line" style="justify-content: space-between">
          <h3>Pokémon</h3>
          <div class="tt-seg">
            <button
              type="button"
              :class="{ on: order === 'usage' }"
              @click="order = 'usage'"
            >
              By usage
            </button>
            <button
              type="button"
              :class="{ on: order === 'wins' }"
              @click="order = 'wins'"
            >
              By win % ({{ leastForWins }}+ Teams)
            </button>
          </div>
        </div>
        <div class="tt-tiles">
          <button
            v-for="row in tiles"
            :key="row.key"
            type="button"
            class="tt-tile"
            :class="{ on: row.key === focused }"
            :aria-pressed="row.key === focused"
            @click="chosen = row.key"
          >
            <IconRenderer :name="row.key" />
            <span class="nm">{{ row.key }}</span>
            <span class="tt-bar"
              ><i
                :style="{
                  width: `${share(row.use, pokemon.rows[0].use) * 100}%`,
                }"
            /></span>
            <span class="sub">
              <span>{{ percent(row.use, pokemon.total) }} of Teams</span>
              <span>{{ percent(row.wins, row.decided) }} won</span>
            </span>
          </button>
        </div>
      </section>
      <aside class="tt-card tt-focus">
        <PokemonFocus
          :name="focused"
          :sides="sides"
          @require="(conditions, about) => emit('require', conditions, about)"
        />
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Condition } from "@/tournament/filter";
import { formatCount, yearOfDay, type GameSide } from "@/tournament/model";
import { coverage, share, tableKinds, tally } from "@/tournament/statistics";

const properties = defineProps<{ sides: GameSide[] }>();

const emit = defineEmits<{
  require: [conditions: Condition[], about: string];
}>();

const leastForWins = 10;
const tileCount = 36;

const order = ref<"usage" | "wins">("usage");
const chosen = ref<string | null>(null);

const pokemonKind = tableKinds.find((entry) => entry.id === "pokemon")!;
const pokemon = computed(() =>
  tally(properties.sides, (team) => pokemonKind.keysOf(team)),
);

const tiles = computed(() => {
  if (order.value === "usage") {
    return pokemon.value.rows.slice(0, tileCount);
  }
  return pokemon.value.rows
    .filter((row) => row.decided >= leastForWins)
    .sort((a, b) => share(b.wins, b.decided) - share(a.wins, a.decided))
    .slice(0, tileCount);
});

/** The Pokémon in the panel: the chosen one while the search still has it, else the most used. */
const focused = computed(() => {
  const rows = pokemon.value.rows;
  if (chosen.value !== null && rows.some((row) => row.key === chosen.value)) {
    return chosen.value;
  }
  return rows[0]?.key ?? null;
});

const percent = (part: number, whole: number) => {
  const value = share(part, whole) * 100;
  return `${value >= 10 ? value.toFixed(0) : value.toFixed(1)}%`;
};

const figures = computed(() => {
  const covered = coverage(properties.sides);
  const span =
    covered.firstDay < 0
      ? ""
      : [
          ...new Set([yearOfDay(covered.firstDay), yearOfDay(covered.lastDay)]),
        ].join("–");
  return [
    ["Games", formatCount(covered.games)],
    ["Matches", formatCount(covered.matches)],
    ["Tournaments", formatCount(covered.tournaments)],
    ["Players", formatCount(covered.players)],
    ["Years", span],
  ];
});
</script>
