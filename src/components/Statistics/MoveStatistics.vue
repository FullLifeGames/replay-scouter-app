<template>
  <div>
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
    return renderUsageDict(moveDict, properties.teams, "Move");
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
