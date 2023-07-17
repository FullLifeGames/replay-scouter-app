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
import type { ApiScoutingResult, Pokemon, Team } from "@/api";
import type { StatsDict } from "@/types/stats";
import { renderUsageDict } from "@/util/statisticFormatting";

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

const statistics = computed(() => {
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

    const outputs = [
      renderUsageDict(twoComboDict, properties.teams, "Combos of 2"),
      renderUsageDict(threeComboDict, properties.teams, "Combos of 3"),
      renderUsageDict(fourComboDict, properties.teams, "Combos of 4"),
      renderUsageDict(fiveComboDict, properties.teams, "Combos of 5"),
      renderUsageDict(sixComboDict, properties.teams, "Combos of 6"),
    ];

    return outputs.join("\n\n");
  }
  return "";
});

defineExpose({ statistics });
</script>

<style scoped>
.statisticsText {
  font-family: Consolas, Menlo, Monaco, "Lucida Console", "Courier New", Courier,
    monospace;
  font-size: 11px;
}
</style>
