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

const pokemonDictionary = computed(() => {
  if (properties.teams) {
    const pokemonDict: StatsDict = {};
    for (const team of properties.teams) {
      if (!team.pokemon || !team.replays) {
        continue;
      }
      const currentPokemon: Set<string> = new Set([]);
      const games = team.replays.length;
      const wins = team.replays.filter((replay) => replay.winForTeam).length;
      const wonGames = team.replays.filter((replay) => replay.winner).length;
      for (const pokemon of team.pokemon) {
        if (!pokemon.name) {
          continue;
        }
        currentPokemon.add(pokemon.name);
      }
      for (const pokemon of currentPokemon) {
        if (!pokemonDict[pokemon]) {
          pokemonDict[pokemon] = { use: 0, wins: 0, wonGames: 0 };
        }
        pokemonDict[pokemon].use += games;
        pokemonDict[pokemon].wins += wins;
        pokemonDict[pokemon].wonGames += wonGames;
      }
    }
    return pokemonDict;
  }
  return {};
});

const statistics = computed(() => {
  if (properties.teams) {
    return renderUsageDict(
      pokemonDictionary.value,
      properties.teams,
      "Pokemon",
    );
  }
  return "";
});

const downloadCsv = () => {
  const csv = renderUsageDictCsv(pokemonDictionary.value, properties.teams);
  saveAs(
    new Blob([csv], { type: "text/csv;charset=utf-8" }),
    "pokemon_statistics.csv",
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
