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
import type { ApiScoutingResult, Pokemon, Team } from "@/api";
import type { StatsDict } from "@/types/stats";
import {
  renderUsageDict,
  renderUsageDictCsv,
} from "@/util/statisticFormatting";
import { saveAs } from "file-saver";

const properties = defineProps<{
  scoutingResult: ApiScoutingResult | null;
  showLeads: boolean;
  teams: Team[];
}>();

const getCombinations = (valuesArray: string[]) => {
  const combi = [];
  let temporary = [];
  const slent = Math.pow(2, valuesArray.length);

  for (let index = 0; index < slent; index++) {
    temporary = [];
    for (const [index_, element] of valuesArray.entries()) {
      if (index & Math.pow(2, index_)) {
        temporary.push(element);
      }
    }
    if (temporary.length > 0) {
      combi.push(temporary);
    }
  }

  combi.sort((a, b) => a.length - b.length);
  return combi;
};

const comboDicts = computed(() => {
  if (properties.teams) {
    const twoComboDict: StatsDict = {};
    const threeComboDict: StatsDict = {};
    const fourComboDict: StatsDict = {};
    const fiveComboDict: StatsDict = {};
    const sixComboDict: StatsDict = {};
    for (const team of properties.teams) {
      if (!team.pokemon || !team.replays) {
        continue;
      }
      const currentPokemon: Pokemon[] = [];
      const games = team.replays.length;
      const wins = team.replays.filter((replay) => replay.winForTeam).length;
      const wonGames = team.replays.filter((replay) => replay.winner).length;
      for (const pokemon of team.pokemon) {
        if (!pokemon.name) {
          continue;
        }
        currentPokemon.push(pokemon);
      }
      const sortedPokemon = [
        ...new Set<string>(
          [...currentPokemon]
            .sort((a, b) => {
              if (properties.showLeads) {
                if (a.lead) {
                  return -1;
                }
                if (b.lead) {
                  return 1;
                }
              }
              if (a.name && b.name) {
                if (a.name > b.name) {
                  return 1;
                }
                if (a.name < b.name) {
                  return 1;
                }
              }
              return 0;
            })
            .map(
              (pokemon) =>
                (pokemon.lead && properties.showLeads ? "(Lead) " : "") +
                pokemon.name,
            )
            .filter((name) => typeof name === "string") as string[],
        ),
      ];
      const combinations = getCombinations(sortedPokemon);

      const iteratableComboDicts = [
        twoComboDict,
        threeComboDict,
        fourComboDict,
        fiveComboDict,
        sixComboDict,
      ];

      let index = 2;
      for (const comboDict of iteratableComboDicts) {
        for (const combinationArray of combinations.filter(
          (comb) => comb.length === index,
        )) {
          const combination = combinationArray.join(" / ");
          if (!comboDict[combination]) {
            comboDict[combination] = { use: 0, wins: 0, wonGames: 0 };
          }
          comboDict[combination].use += games;
          comboDict[combination].wins += wins;
          comboDict[combination].wonGames += wonGames;
        }
        index++;
      }
    }

    return [
      twoComboDict,
      threeComboDict,
      fourComboDict,
      fiveComboDict,
      sixComboDict,
    ];
  }
  return [];
});

const statistics = computed(() => {
  if (properties.teams && comboDicts.value.length > 0) {
    const outputs = [
      renderUsageDict(comboDicts.value[0], properties.teams, "Combos of 2"),
      renderUsageDict(comboDicts.value[1], properties.teams, "Combos of 3"),
      renderUsageDict(comboDicts.value[2], properties.teams, "Combos of 4"),
      renderUsageDict(comboDicts.value[3], properties.teams, "Combos of 5"),
      renderUsageDict(comboDicts.value[4], properties.teams, "Combos of 6"),
    ];

    return outputs.join("\n\n");
  }
  return "";
});

const downloadCsv = () => {
  const csvs = comboDicts.value.map((dict) =>
    renderUsageDictCsv(dict, properties.teams),
  );
  for (const csv of csvs) {
    saveAs(
      new Blob([csv], { type: "text/csv;charset=utf-8" }),
      `combos_of_${csvs.indexOf(csv) + 2}.csv`,
    );
  }
};

defineExpose({ statistics });
</script>

<style scoped>
.statisticsText {
  font-family: Consolas, Menlo, Monaco, "Lucida Console", "Courier New", Courier,
    monospace;
  font-size: 11px;
}
</style>
