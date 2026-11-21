<template>
  <span class="tt-line">
    <label class="tt-label" for="tt-sort">Sort by</label>
    <select
      id="tt-sort"
      :value="state.sort"
      @change="
        view.update({
          sort: ($event.target as HTMLSelectElement).value as SortKey,
          reversed: false,
        })
      "
    >
      <option v-for="entry in sortKeys" :key="entry.key" :value="entry.key">
        {{ entry.label }}
      </option>
    </select>
    <button
      type="button"
      class="tt-btn"
      :aria-pressed="state.reversed"
      title="Turn the order around"
      @click="view.update({ reversed: !state.reversed })"
    >
      {{ state.reversed ? "↑" : "↓" }} {{ direction }}
    </button>
  </span>
</template>

<script setup lang="ts">
import { sortKeys, type SortKey } from "@/tournament/filter";
import { useTournamentView } from "@/tournament/useTournamentView";

/** The one sort key with its direction, shared by the Matches and the Teams tab. */
const view = useTournamentView();
const state = view.state;

const turned: Record<SortKey, string> = {
  date: "oldest first",
  format: "Z to A",
  player: "Z to A",
  games: "fewest first",
  rating: "lowest first",
  views: "fewest first",
};

const direction = computed(() =>
  state.value.reversed
    ? turned[state.value.sort]
    : (sortKeys.find((entry) => entry.key === state.value.sort)?.usual ?? ""),
);
</script>
