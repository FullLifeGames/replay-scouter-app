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
import type { ApiScoutingResult } from "@/api";
import { renderUsageDict } from "@/util/statisticFormatting";

const props = defineProps<{
  scoutingResult: ApiScoutingResult | null;
}>();

const statistics = computed(() => {
  const scoutingResult = props.scoutingResult;
  if (scoutingResult && scoutingResult.teams) {
    const teams = scoutingResult.teams;

    const moveDict: { [move: string]: { use: number; wins: number } } = {};
    for (const team of teams) {
      if (!team.pokemon || !team.replays) {
        continue;
      }
      const currentMoves: Set<string> = new Set([]);
      const games = team.replays.length;
      const wins = team.replays.filter((replay) => replay.winForTeam).length;
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
          moveDict[move] = { use: 0, wins: 0 };
        }
        moveDict[move].use += games;
        moveDict[move].wins += wins;
      }
    }
    return renderUsageDict(moveDict, teams, "Move");
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
