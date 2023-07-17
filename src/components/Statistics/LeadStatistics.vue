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
    const leadDict: StatsDict = {};
    for (const team of properties.teams) {
      if (!team.pokemon || !team.replays) {
        continue;
      }
      const currentLead: Set<string> = new Set([]);
      const games = team.replays.length;
      const wins = team.replays.filter((replay) => replay.winForTeam).length;
      const wonGames = team.replays.filter((replay) => replay.winner).length;
      for (const pokemon of team.pokemon) {
        if (!pokemon.lead) {
          continue;
        }
        if (!pokemon.name) {
          continue;
        }
        currentLead.add(pokemon.name);
      }
      for (const pokemon of currentLead) {
        if (!leadDict[pokemon]) {
          leadDict[pokemon] = { use: 0, wins: 0, wonGames: 0 };
        }
        leadDict[pokemon].use += games;
        leadDict[pokemon].wins += wins;
        leadDict[pokemon].wonGames += wonGames;
      }
    }
    return renderUsageDict(leadDict, properties.teams, "Lead");
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
