<template>
  <div v-if="teams && outputTeams">
    <b-form-group
      label-class="fw-bold pt-0"
      label="Search Queries"
      label-for="search-input"
      description="Enter Search Queries for the clickable cards down below"
    >
      <b-input-group>
        <b-form-tags
          id="search-input"
          v-model="searchQueries"
          :add-on-change="true"
          placeholder="As an example, you can search for specific Pokémon (Clefable), Moves (Stealth Rock), Items (Leftovers) or even the opponents"
        ></b-form-tags>
      </b-input-group>
    </b-form-group>
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
import type { ApiScoutingResult } from "@/api";

const props = defineProps<{
  scoutingResult: ApiScoutingResult | null;
}>();

const collapseVisible = ref([] as boolean[]);

const searchQueries = ref([] as string[]);

const teamIndizes = computed(() => {
  if (props.scoutingResult && props.scoutingResult.teams) {
    const teams = props.scoutingResult.teams;
    const keys: number[] = [];
    for (let i = 0; i < teams.length; i++) {
      if (searchQueries.value.length === 0) {
        keys.push(i);
        continue;
      }
      const validList: boolean[] = [];
      const team = teams[i];

      for (const rawSearchQuery of searchQueries.value) {
        let valid = false;
        const searchQuery = rawSearchQuery.trim().toLowerCase();
        if (team.pokemon) {
          valid ||= team.pokemon.some((pokemon) =>
            pokemon.name?.toLowerCase().includes(searchQuery)
          );
          valid ||= team.pokemon.some((pokemon) =>
            pokemon.moves?.some((move) =>
              move.toLowerCase().includes(searchQuery)
            )
          );
          valid ||= team.pokemon.some((pokemon) =>
            pokemon.ability?.toLowerCase().includes(searchQuery)
          );
          valid ||= team.pokemon.some((pokemon) =>
            pokemon.item?.toLowerCase().includes(searchQuery)
          );
          valid ||= team.pokemon.some((pokemon) =>
            pokemon.altNames?.some((altName) =>
              altName.toLowerCase().includes(searchQuery)
            )
          );
          valid ||= team.pokemon.some((pokemon) =>
            pokemon.teraType?.toLowerCase().includes(searchQuery)
          );
          valid ||= team.pokemon.some((pokemon) =>
            pokemon.formName?.toLowerCase().includes(searchQuery)
          );
        }
        if (team.format) {
          valid ||= team.format.toLowerCase().includes(searchQuery);
        }
        if (team.replays) {
          valid ||= team.replays.some((replay) =>
            replay.p1?.toLowerCase().includes(searchQuery)
          );
          valid ||= team.replays.some((replay) =>
            replay.p2?.toLowerCase().includes(searchQuery)
          );
          valid ||= team.replays.some((replay) =>
            replay.p1Id?.toLowerCase().includes(searchQuery)
          );
          valid ||= team.replays.some((replay) =>
            replay.p2Id?.toLowerCase().includes(searchQuery)
          );
          valid ||= team.replays.some((replay) =>
            replay.id?.toLowerCase().includes(searchQuery)
          );
        }
        validList.push(valid);
      }

      if (validList.every((entry) => entry === true)) {
        keys.push(i);
      }
    }
    return keys;
  }
  return [];
});

const teams = computed(() => {
  if (props.scoutingResult && props.scoutingResult.teams && teamIndizes.value) {
    const teams = props.scoutingResult.teams;
    return teamIndizes.value.map((index) => teams[index]);
  }
  return null;
});

watch(teams, () => {
  if (teams.value !== null) {
    collapseVisible.value = teams.value.map(() => false);
  }
});

const outputTeams = computed(() => {
  if (
    props.scoutingResult &&
    props.scoutingResult.outputs &&
    props.scoutingResult.outputs.teams
  ) {
    const outputTeams = props.scoutingResult.outputs.teams;
    return teamIndizes.value.map((index) => outputTeams[index]);
  }
  return null;
});
</script>
