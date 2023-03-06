<template>
  <div>
    <SearchQuery :scouting-result="props.scoutingResult" @change="change" />
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

const props = defineProps<{
  scoutingResult: ApiScoutingResult | null;
}>();

const getCombinations = (valuesArray: string[]) => {
  const combi = [];
  let temp = [];
  const slent = Math.pow(2, valuesArray.length);

  for (let i = 0; i < slent; i++) {
    temp = [];
    for (let j = 0; j < valuesArray.length; j++) {
      if (i & Math.pow(2, j)) {
        temp.push(valuesArray[j]);
      }
    }
    if (temp.length > 0) {
      combi.push(temp);
    }
  }

  combi.sort((a, b) => a.length - b.length);
  return combi;
};

const teams = ref(props.scoutingResult?.teams ?? ([] as Team[]));
const change = (searchedTeams: Team[]) => {
  teams.value = searchedTeams;
};

const statistics = computed(() => {
  if (teams.value) {
    const twoComboDict: StatsDict = {};
    const threeComboDict: StatsDict = {};
    const fourComboDict: StatsDict = {};
    const fiveComboDict: StatsDict = {};
    const sixComboDict: StatsDict = {};
    for (const team of teams.value) {
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
      const sortedPokemon = Array.from(currentPokemon).sort();
      const combinations = getCombinations(sortedPokemon);

      const iteratableComboDicts = [
        twoComboDict,
        threeComboDict,
        fourComboDict,
        fiveComboDict,
        sixComboDict,
      ];

      let i = 2;
      for (const comboDict of iteratableComboDicts) {
        for (const combinationArray of combinations.filter(
          (comb) => comb.length === i
        )) {
          const combination = combinationArray.join(" / ");
          if (!comboDict[combination]) {
            comboDict[combination] = { use: 0, wins: 0, wonGames: 0 };
          }
          comboDict[combination].use += games;
          comboDict[combination].wins += wins;
          comboDict[combination].wonGames += wonGames;
        }
        i++;
      }
    }

    const outputs = [
      renderUsageDict(twoComboDict, teams.value, "Combos of 2"),
      renderUsageDict(threeComboDict, teams.value, "Combos of 3"),
      renderUsageDict(fourComboDict, teams.value, "Combos of 4"),
      renderUsageDict(fiveComboDict, teams.value, "Combos of 5"),
      renderUsageDict(sixComboDict, teams.value, "Combos of 6"),
    ];

    return outputs.join("\n\n");
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
