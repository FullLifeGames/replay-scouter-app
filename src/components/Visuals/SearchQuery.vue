<template>
  <div>
    <b-form-group
      label-class="fw-bold pt-0"
      label="Search Queries"
      label-for="search-input"
      description="Enter Search Queries for the content down below"
    >
      <b-input-group v-for="(_, index) in searchQueries" :key="index">
        <b-form-tags
          id="search-input"
          v-model="searchQueries[index]"
          :add-on-change="true"
          placeholder="As an example, you can search for specific Pokémon, Moves, Items, Formats or even the Players"
          separator=",;"
        ></b-form-tags>
        <b-input-group-append>
          <b-button
            variant="outline-secondary"
            @click="index === 0 ? addSearchQuery() : deleteSearchQuery(index)"
            ><i-bi-plus-circle v-if="index === 0" class="queryButtonIcon" />
            <i-bi-dash-circle v-if="index !== 0" class="queryButtonIcon" />
            Possible Query</b-button
          >
        </b-input-group-append>
      </b-input-group>
    </b-form-group>
  </div>
</template>

<script setup lang="ts">
import type { ApiScoutingResult, Team } from "@/api";

const props = defineProps<{
  scoutingResult: ApiScoutingResult | null;
}>();

const emits = defineEmits<{
  (event: "change", teams: Team[], outputs: string[]): void;
}>();

const searchQueries = ref([[]] as string[][]);
const addSearchQuery = () => {
  searchQueries.value.push([]);
};
const deleteSearchQuery = (index: number) => {
  searchQueries.value.splice(index, 1);
};

const teamIndizes = computed(() => {
  if (props.scoutingResult && props.scoutingResult.teams) {
    const teams = props.scoutingResult.teams;
    const keys: number[] = [];
    for (let i = 0; i < teams.length; i++) {
      const team = teams[i];
      if (team.pokemon?.some((pokemon) => pokemon.name) !== true) {
        continue;
      }

      const fullValidationList = [];

      for (const rawSearchQueries of searchQueries.value) {
        if (rawSearchQueries.length === 0) {
          continue;
        }
        const validList: boolean[] = [];

        for (const rawSearchQuery of rawSearchQueries) {
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
              replay.playerInfo?.playerName?.toLowerCase().includes(searchQuery)
            );
            valid ||= team.replays.some((replay) =>
              replay.id?.toLowerCase().includes(searchQuery)
            );
          }
          validList.push(valid);
        }

        fullValidationList.push(validList.every((entry) => entry === true));
      }
      if (
        fullValidationList.length === 0 ||
        fullValidationList.some((entry) => entry === true)
      ) {
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

watch(teamIndizes, () => {
  if (teams.value !== null && outputTeams.value !== null) {
    emits("change", teams.value, outputTeams.value);
  } else {
    emits("change", [], []);
  }
});

watch(teams, () => {
  if (teams.value !== null && outputTeams.value !== null) {
    emits("change", teams.value, outputTeams.value);
  } else {
    emits("change", [], []);
  }
});

watch(outputTeams, () => {
  if (teams.value !== null && outputTeams.value !== null) {
    emits("change", teams.value, outputTeams.value);
  } else {
    emits("change", [], []);
  }
});
</script>

<style scoped>
.queryButtonIcon {
  margin-top: -4px;
}
</style>
