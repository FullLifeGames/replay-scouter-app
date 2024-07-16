<template>
  <div>
    <SearchQuery
      :multiple="false"
      name="Pokémon Filter"
      placeholder="Enter the Pokémon of which you want to show the item usage of"
      :scouting-result="scoutingResult"
      :sorting-active="false"
      @change="change"
    />
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

const applyFilter = (unfiltered?: string | null) => {
  return (
    unfiltered
      ?.toLowerCase()
      .trim()
      .replaceAll(/[\W_]+/g, "") ?? ""
  );
};

const searchQueries = ref<string[][]>([[]]);
const change = (
  _: Team[],
  __: string[],
  ___: number[],
  determinedSearchQueries: string[][],
) => {
  searchQueries.value = determinedSearchQueries.map((array) =>
    array.map((element) => applyFilter(element)),
  );
};

const itemDictionary = computed(() => {
  if (properties.teams) {
    const itemDict: StatsDict = {};
    for (const team of properties.teams) {
      if (!team.pokemon || !team.replays) {
        continue;
      }
      const currentItem: Set<string> = new Set([]);
      const games = team.replays.length;
      const wins = team.replays.filter((replay) => replay.winForTeam).length;
      const wonGames = team.replays.filter((replay) => replay.winner).length;
      for (const pokemon of team.pokemon) {
        if (!pokemon.item) {
          continue;
        }
        if (
          !searchQueries.value.some((entry) =>
            entry.some((query) => applyFilter(pokemon.name).includes(query)),
          )
        ) {
          continue;
        }
        currentItem.add(pokemon.name + ": " + pokemon.item);
      }
      for (const item of currentItem) {
        if (!itemDict[item]) {
          itemDict[item] = { use: 0, wins: 0, wonGames: 0 };
        }
        itemDict[item].use += games;
        itemDict[item].wins += wins;
        itemDict[item].wonGames += wonGames;
      }
    }
    return itemDict;
  }
  return {};
});

const statistics = computed(() => {
  if (properties.teams) {
    return renderUsageDict(
      itemDictionary.value,
      properties.teams,
      "Items By Pokémon",
    );
  }
  return "";
});

const downloadCsv = () => {
  const csv = renderUsageDictCsv(itemDictionary.value, properties.teams);
  saveAs(
    new Blob([csv], { type: "text/csv;charset=utf-8" }),
    "item_by_pokemon_statistics.csv",
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
