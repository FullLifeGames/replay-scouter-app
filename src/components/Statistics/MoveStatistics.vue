<template>
  <div>
    <b-form-textarea
      v-if="statistics !== ''"
      v-model="statistics"
      class="statisticsText mb-3"
      rows="53"
      :readonly="true"
    />
    <b-button @click="downloadCsv">Download CSV</b-button>
  </div>
</template>

<script setup lang="ts">
import type { ApiScoutingResult, Team } from "@/api";
import type { StatsDict } from "@/types/stats";
import {
  renderUsageDict,
  renderUsageDictCsv,
} from "@/util/statisticFormatting";
import { saveAs } from "file-saver";

const properties = defineProps<{
  scoutingResult: ApiScoutingResult | null;
  teams: Team[];
}>();

const moveDictionary = computed(() => {
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
        for (const move of pokemon.moves) {
          currentMoves.add(move);
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
    return moveDict;
  }
  return {};
});

const statistics = computed(() => {
  if (properties.teams) {
    return renderUsageDict(moveDictionary.value, properties.teams, "Move");
  }
  return "";
});

const downloadCsv = () => {
  const csv = renderUsageDictCsv(moveDictionary.value, properties.teams);
  saveAs(
    new Blob([csv], { type: "text/csv;charset=utf-8" }),
    "move_statistics.csv",
  );
};
</script>

<style scoped>
.statisticsText {
  font-family: Consolas, Menlo, Monaco, "Lucida Console", "Courier New", Courier,
    monospace;
  font-size: 11px;
}
</style>
