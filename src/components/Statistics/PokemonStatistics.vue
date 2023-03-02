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
import { renderUsageDict } from "@/util/statisticFormatting";

const props = defineProps<{
  scoutingResult: ApiScoutingResult | null;
}>();

const teams = ref(props.scoutingResult?.teams ?? ([] as Team[]));
const change = (searchedTeams: Team[]) => {
  teams.value = searchedTeams;
};

const statistics = computed(() => {
  if (teams.value) {
    const pokemonDict: { [pokemon: string]: { use: number; wins: number } } =
      {};
    for (const team of teams.value) {
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
        currentPokemon.add(pokemon.name);
      }
      for (const pokemon of currentPokemon) {
        if (!pokemonDict[pokemon]) {
          pokemonDict[pokemon] = { use: 0, wins: 0 };
        }
        pokemonDict[pokemon].use += games;
        pokemonDict[pokemon].wins += wins;
      }
    }
    return renderUsageDict(pokemonDict, teams.value, "Pokemon");
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
