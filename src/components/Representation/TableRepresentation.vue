<template>
  <div>
    <MonTable :scouting-result="props.scoutingResult" :species="species" />
  </div>
</template>

<script setup lang="ts">
import type { ApiScoutingResult, Team } from "@/api";
import type { Species } from "@pkmn/dex";

import { Dex } from "@pkmn/dex";

const props = defineProps<{
  scoutingResult: ApiScoutingResult | null;
  teams: Team[];
}>();

const generationDex = computed(() => Dex.forGen(9));

const species = computed(() => {
  const computedSpecies: Species[][] = [];
  for (const team of props.teams) {
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
