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
    return renderUsageDict(pokemonDict, properties.teams, "Pokemon");
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
