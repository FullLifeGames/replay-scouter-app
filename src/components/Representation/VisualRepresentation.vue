<template>
  <div v-if="teams && outputTeams">
    <SearchQuery :scouting-result="props.scoutingResult" @change="change" />
    <b-card v-for="(team, index) in teams" :key="index" no-body class="mb-2">
      <b-card-header
        header-tag="header"
        role="tab"
        style="cursor: pointer"
        @click="collapseVisible[index] = !collapseVisible[index]"
      >
        <IconRenderer
          v-for="(pokemon, pokemonIndex) in team.pokemon"
          :key="pokemonIndex"
          :name="pokemon.name"
        />
      </b-card-header>
      <b-collapse
        id="accordion-1"
        v-model="collapseVisible[index]"
        accordion="my-accordion"
        role="tabpanel"
      >
        <b-card-body>
          <b-card-text>
            <pre>{{ outputTeams[index] }}</pre>
          </b-card-text>
        </b-card-body>
      </b-collapse>
    </b-card>
  </div>
</template>

<script setup lang="ts">
import type { ApiScoutingResult, Team } from "@/api";

const props = defineProps<{
  scoutingResult: ApiScoutingResult | null;
}>();

const collapseVisible = ref([] as boolean[]);

const teams = ref(props.scoutingResult?.teams ?? ([] as Team[]));
const outputTeams = ref(
  props.scoutingResult?.outputs?.teams ?? ([] as string[])
);

const change = (searchedTeams: Team[], searchedOutputs: string[]) => {
  teams.value = searchedTeams;
  outputTeams.value = searchedOutputs;
};

watch(teams, () => {
  if (teams.value !== null) {
    collapseVisible.value = teams.value.map(() => false);
  }
});
</script>
