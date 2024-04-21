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

const leadDictionary = computed(() => {
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
    return leadDict;
  }
  return {};
});

const statistics = computed(() => {
  if (properties.teams) {
    return renderUsageDict(leadDictionary.value, properties.teams, "Lead");
  }
  return "";
});

const downloadCsv = () => {
  const csv = renderUsageDictCsv(leadDictionary.value, properties.teams);
  saveAs(
    new Blob([csv], { type: "text/csv;charset=utf-8" }),
    "lead_statistics.csv",
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
