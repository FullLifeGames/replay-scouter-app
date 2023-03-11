<template>
  <div>
    <SearchQuery :scouting-result="props.scoutingResult" @change="change" />
    <MonTable :scouting-result="props.scoutingResult" :species="species" />
  </div>
</template>

<script setup lang="ts">
import type { ApiScoutingResult, Team } from "@/api";
import type { Species } from "@pkmn/dex";

import { Dex } from "@pkmn/dex";

const props = defineProps<{
  scoutingResult: ApiScoutingResult | null;
}>();

const generationDex = computed(() => Dex.forGen(9));

const teams = ref(props.scoutingResult?.teams ?? ([] as Team[]));

const change = (searchedTeams: Team[]) => {
  teams.value = searchedTeams;
};

const species = computed(() => {
  const computedSpecies: Species[][] = [];
  for (const team of teams.value) {
    if (team.pokemon) {
      const speciesArr: Species[] = [];
      for (const pokemon of team.pokemon) {
        if (pokemon.name) {
          speciesArr.push(generationDex.value.species.get(pokemon.name));
        }
      }
      computedSpecies.push(speciesArr);
    }
  }
  return computedSpecies;
});
</script>
