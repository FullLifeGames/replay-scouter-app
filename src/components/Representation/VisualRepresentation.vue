<template>
  <div v-if="teams && outputTeams">
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
  teams: Team[];
  outputTeams: string[];
}>();

const collapseVisible = ref([] as boolean[]);

watch(props.teams, () => {
  if (props.teams !== null) {
    collapseVisible.value = props.teams.map(() => false);
  }
});
</script>
