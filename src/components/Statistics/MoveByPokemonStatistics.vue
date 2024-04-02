<template>
  <div>
    <SearchQuery
      :multiple="false"
      name="Pokémon Filter"
      placeholder="Enter the Pokémon of which you want to show the move usage of"
      :scouting-result="scoutingResult"
      :sorting-active="false"
      @change="change"
    />
    <b-form-textarea
      v-if="statistics !== ''"
      v-model="statistics"
      class="statisticsText"
      rows="53"
      :readonly="true"
    />
  </div>
</template>

<script setup lang="ts">
import type { ApiScoutingResult, Team } from "@/api";
import type { StatsDict } from "@/types/stats";
import { renderUsageDict } from "@/util/statisticFormatting";

const properties = defineProps<{
  scoutingResult: ApiScoutingResult | null;
  teams: Team[];
}>();

const searchQueries = ref<string[][]>([[]]);
const change = (
  _: Team[],
  __: string[],
  ___: number[],
  determinedSearchQueries: string[][],
) => {
  searchQueries.value = determinedSearchQueries;
};

const statistics = computed(() => {
  if (properties.teams) {
    const moveDict: StatsDict = {};
    for (const team of properties.teams) {
      if (!team.pokemon || !team.replays) {
        continue;
      }
      const currentMoves: Set<string> = new Set([]);
      const games = team.replays.length;
      const wins = team.replays.filter((replay) => replay.winForTeam).length;
      const wonGames = team.replays.filter((replay) => replay.winner).length;
      for (const pokemon of team.pokemon) {
        if (!pokemon.moves) {
          continue;
        }
        if (
          !searchQueries.value.some((entry) =>
            entry.some((query) => pokemon.name?.includes(query)),
          )
        ) {
          continue;
        }
        for (const move of pokemon.moves) {
          currentMoves.add(pokemon.name + ": " + move);
        }
      }
      for (const move of currentMoves) {
        if (!moveDict[move]) {
          moveDict[move] = { use: 0, wins: 0, wonGames: 0 };
        }
        moveDict[move].use += games;
        moveDict[move].wins += wins;
        moveDict[move].wonGames += wonGames;
      }
    }
    return renderUsageDict(moveDict, properties.teams, "Moves By Pokémon");
  }
  return "";
});
</script>

<style scoped>
.statisticsText {
  font-family: Consolas, Menlo, Monaco, "Lucida Console", "Courier New", Courier,
    monospace;
  font-size: 11px;
}
</style>
