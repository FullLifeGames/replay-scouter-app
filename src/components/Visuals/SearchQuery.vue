<template>
  <div>
    <b-form-group
      class="mb-3"
      label-class="fw-bold pt-0"
      :label="name ?? 'Search Queries'"
      label-for="search-input"
      :description="
        'Enter ' + (name ?? 'Search Queries') + ' for the content down below'
      "
    >
      <b-input-group v-for="(_, index) in searchQueries" :key="index">
        <b-form-tags
          id="search-input"
          v-model="searchQueries[index]"
          :add-on-change="true"
          :placeholder="
            placeholder ??
            'As an example, you can search for specific Pokémon, Moves, Items, Formats or even the Players (negate with a \'-\' in front)'
          "
          separator=",;"
        ></b-form-tags>
        <template v-if="multiple" #append>
          <b-button
            class="queryButton"
            variant="outline-secondary"
            @click="index === 0 ? addSearchQuery() : deleteSearchQuery(index)"
            ><i-bi-plus-circle v-if="index === 0" class="queryButtonIcon" />
            <i-bi-dash-circle v-if="index !== 0" class="queryButtonIcon" />
            Possible Query</b-button
          >
        </template>
      </b-input-group>
    </b-form-group>
    <SortInput v-show="properties.sortingActive" @change="sortChange" />
  </div>
</template>

<script setup lang="ts">
import type { ApiScoutingResult, Team } from "@/api";
import type { SortOptions } from "@/types/sortOptions";
import { useTeamCompareFunction } from "@/util/teamCompareFunction";
import { determineValidTeams } from "@/util/validator";

const properties = defineProps<{
  defaultSortOptions?: SortOptions[];
  multiple?: boolean;
  name?: string;
  placeholder?: string;
  scoutingResult: ApiScoutingResult | null;
  sortingActive?: boolean;
}>();

const emits = defineEmits<{
  (
    event: "change",
    teams: Team[],
    outputs: string[],
    teamIndizes: number[],
    searchQueries: string[][],
    fullValidationListList: boolean[][],
  ): void;
}>();

const searchQueries = ref<string[][]>([[]]);
const addSearchQuery = () => {
  searchQueries.value.push([]);
};
const deleteSearchQuery = (index: number) => {
  searchQueries.value.splice(index, 1);
};

const sortOptions = ref<SortOptions[]>(properties.defaultSortOptions ?? []);
const sortChange = (values: SortOptions[]) => {
  sortOptions.value = values;
};
const teamCompareFunction = useTeamCompareFunction(sortOptions);

const fullValidationListList = computed(() => {
  const currentFullValidationListList = [];
  if (properties.scoutingResult && properties.scoutingResult.teams) {
    const teams = properties.scoutingResult.teams;
    const keys: number[] = [];
    for (const [index, team] of teams.entries()) {
      if (team.pokemon?.some((pokemon) => pokemon.name) !== true) {
        continue;
      }

      const fullValidationList: boolean[] = [];
      for (const rawSearchQueries of searchQueries.value) {
        const validList = determineValidTeams(rawSearchQueries, team);
        fullValidationList.push(validList.every((entry) => entry === true));
      }
      if (
        fullValidationList.length === 0 ||
        fullValidationList.includes(true)
      ) {
        keys.push(index);
      }
      currentFullValidationListList.push(fullValidationList);
    }
  }
  return currentFullValidationListList;
});

const teamIndizes = computed(() => {
  if (properties.scoutingResult && properties.scoutingResult.teams) {
    const teams = properties.scoutingResult.teams;
    const keys: number[] = [];
    const currentFullValidationListList: boolean[][] = [];
    for (const [index, team] of teams.entries()) {
      if (team.pokemon?.some((pokemon) => pokemon.name) !== true) {
        continue;
      }

      const fullValidationList: boolean[] = [];
      for (const rawSearchQueries of searchQueries.value) {
        const validList = determineValidTeams(rawSearchQueries, team);
        fullValidationList.push(validList.every((entry) => entry === true));
      }
      if (
        fullValidationList.length === 0 ||
        fullValidationList.includes(true)
      ) {
        keys.push(index);
      }
      currentFullValidationListList.push(fullValidationList);
    }
    return keys.sort(teamCompareFunction.value(teams));
  }
  return [];
});

const teams = computed(() => {
  if (properties.scoutingResult?.teams && teamIndizes.value) {
    const teams = properties.scoutingResult.teams;
    return teamIndizes.value.map((index) => teams[index]);
  }
  return null;
});

const outputTeams = computed(() => {
  if (properties.scoutingResult?.outputs?.teams) {
    const outputTeams = properties.scoutingResult.outputs.teams;
    return teamIndizes.value.map((index) => outputTeams[index]);
  }
  return null;
});

const emitChange = () => {
  if (teams.value !== null && outputTeams.value !== null) {
    emits(
      "change",
      teams.value,
      outputTeams.value,
      teamIndizes.value,
      searchQueries.value,
      fullValidationListList.value,
    );
  } else {
    emits("change", [], [], [], [], []);
  }
};

watch(teamIndizes, () => {
  emitChange();
});

emitChange();

defineExpose({ searchQueries, sortOptions });
</script>

<style scoped>
.queryButtonIcon {
  margin-top: -4px;
}
</style>
