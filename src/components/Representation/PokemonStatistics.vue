<template>
  <div>
    <b-form-textarea
      v-if="statistics !== ''"
      v-model="statistics"
      class="statisticsText"
      rows="18"
      :readonly="true"
    />
  </div>
</template>

<script setup lang="ts">
import type { ApiScoutingResult, Team } from "@/api";

const props = defineProps<{
  scoutingResult: ApiScoutingResult | null;
}>();

const header = `+ ---- + ------------------ + ---- + ------- + ------- +
| Rank | Pokemon            | Use  | Usage % |  Win %  |
+ ---- + ------------------ + ---- + ------- + ------- +`;

const numberOfSpacesPerEntry = [4, 18, 4, 7, 7];
const alignmentOfEntry = ["l", "l", "r", "r", "r"];

const formatRegardingIndex = (entry: string, index: number) => {
  const numberOfSpaces = numberOfSpacesPerEntry[index - 1];
  const alignment = alignmentOfEntry[index - 1];
  let formattedEntry = entry;
  if (alignment === "l") {
    formattedEntry = formattedEntry.padEnd(numberOfSpaces);
  } else {
    formattedEntry = formattedEntry.padStart(numberOfSpaces);
  }
  return formattedEntry;
};

const formatPercentage = (num: number) => {
  return (Math.round(num * 10000) / 100).toFixed(2) + "%";
};

const statistics = computed(() => {
  const scoutingResult = props.scoutingResult;
  if (scoutingResult && scoutingResult.teams) {
    const teams = scoutingResult.teams;
    let output = header;
    const numberOfBattles = teams.reduce((previous: number, team: Team) => {
      const currentTeamReplays = team.replays?.length;
      return previous + (!currentTeamReplays ? 0 : currentTeamReplays);
    }, 0);

    const pokemonDict: { [pokemon: string]: { use: number; wins: number } } =
      {};
    for (const team of teams) {
      if (!team.pokemon || !team.replays) {
        continue;
      }
      const currentPokemon: Set<string> = new Set([]);
      const games = team.replays.length;
      const wins = team.replays.filter((replay) => replay.winForTeam).length;
      for (const pokemon of team.pokemon) {
        if (!pokemon.name) {
          continue;
        }
        if (!pokemonDict[pokemon.name]) {
          pokemonDict[pokemon.name] = { use: 0, wins: 0 };
        }
        pokemonDict[pokemon.name].use += games;
        pokemonDict[pokemon.name].wins += wins;
        currentPokemon.add(pokemon.name);
      }
    }
    const pokemonList = Object.entries(pokemonDict).map((entry) => {
      return { pokemon: entry[0], use: entry[1].use, wins: entry[1].wins };
    });
    pokemonList.sort((a, b) => b.use - a.use);

    let rank = 1;
    for (const pokemonEntry of pokemonList) {
      if (numberOfBattles !== 0 && pokemonEntry.use !== 0) {
        let line = "\n| " + formatRegardingIndex(rank + "", 1) + " | ";
        line += formatRegardingIndex(pokemonEntry.pokemon, 2) + " | ";
        line += formatRegardingIndex(pokemonEntry.use + "", 3) + " | ";
        line +=
          formatRegardingIndex(
            formatPercentage(pokemonEntry.use / numberOfBattles),
            4
          ) + " | ";
        line +=
          formatRegardingIndex(
            formatPercentage(pokemonEntry.wins / pokemonEntry.use),
            5
          ) + " |";

        output += line;
        rank++;
      }
    }

    return output;
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
