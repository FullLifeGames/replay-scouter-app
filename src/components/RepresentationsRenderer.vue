<template>
  <div>
    <b-input-group>
      <b-form-select
        v-model="selectedRepresentation"
        :options="representations"
      />
      <b-input-group-append>
        <b-button variant="outline-secondary" @click="switchSearch"
          >{{ showSearch ? "Hide" : "Show" }} Search</b-button
        >
      </b-input-group-append>
    </b-input-group>
    <div v-if="scoutingResult !== null" class="mb-3">
      <hr />
      <SearchQuery
        v-if="searchActive"
        :multiple="true"
        :scouting-result="scoutingResult"
        :sorting-active="representationOptionsVisible"
        @change="change"
      />
      <TextRepresentation
        v-if="selectedRepresentation === 'TextRepresentation'"
        :scouting-result="scoutingResult"
        :teams="teams"
        :output-teams="outputTeams"
      />
      <TableRepresentation
        v-if="selectedRepresentation === 'TableRepresentation'"
        :scouting-result="scoutingResult"
        :teams="teams"
        :output-teams="outputTeams"
      />
      <VisualRepresentation
        v-if="selectedRepresentation === 'VisualRepresentation'"
        :complete="complete"
        :scouting-result="scoutingResult"
        :teams="teams"
        :output-teams="outputTeams"
      />
      <GraphStatistics
        v-if="selectedRepresentation === 'GraphStatistics'"
        :scouting-result="scoutingResult"
        :teams="teams"
        :output-teams="outputTeams"
      />
      <PokemonStatistics
        v-if="selectedRepresentation === 'PokemonStatistics'"
        :scouting-result="scoutingResult"
        :teams="teams"
        :output-teams="outputTeams"
      />
      <CombosStatisticsWithoutLeads
        v-if="selectedRepresentation === 'CombosStatisticsWithoutLeads'"
        :scouting-result="scoutingResult"
        :teams="teams"
        :output-teams="outputTeams"
      />
      <CombosStatisticsWithLeads
        v-if="selectedRepresentation === 'CombosStatisticsWithLeads'"
        :scouting-result="scoutingResult"
        :teams="teams"
        :output-teams="outputTeams"
      />
      <ItemStatistics
        v-if="selectedRepresentation === 'ItemStatistics'"
        :scouting-result="scoutingResult"
        :teams="teams"
        :output-teams="outputTeams"
      />
      <ItemByPokemonStatistics
        v-if="selectedRepresentation === 'ItemByPokemonStatistics'"
        :scouting-result="scoutingResult"
        :teams="teams"
        :output-teams="outputTeams"
      />
      <LeadStatistics
        v-if="selectedRepresentation === 'LeadStatistics'"
        :scouting-result="scoutingResult"
        :teams="teams"
        :output-teams="outputTeams"
      />
      <MoveStatistics
        v-if="selectedRepresentation === 'MoveStatistics'"
        :scouting-result="scoutingResult"
        :teams="teams"
        :output-teams="outputTeams"
      />
      <MoveByPokemonStatistics
        v-if="selectedRepresentation === 'MoveByPokemonStatistics'"
        :scouting-result="scoutingResult"
        :teams="teams"
        :output-teams="outputTeams"
      />
      <RawRepresentation
        v-if="selectedRepresentation === 'RawRepresentation'"
        :scouting-result="scoutingResult"
        :teams="teams"
        :output-teams="outputTeams"
      />
      <ListRepresentation
        v-if="selectedRepresentation === 'ListRepresentation'"
        :scouting-result="scoutingResult"
        :teams="teams"
        :output-teams="outputTeams"
      />
      <RepresentationPagination
        v-if="representationOptionsVisible"
        :teams="filteredTeams"
        :output-teams="filteredOutputTeams"
        @change="changePage"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ApiScoutingResult, Team } from "@/api";

const properties = defineProps<{
  complete?: boolean;
  scoutingResult: ApiScoutingResult | null;
}>();

const emit = defineEmits<{
  (event: "switchSearch", showSearch: boolean): void;
}>();

const teams = ref<Team[]>(properties.scoutingResult?.teams ?? []);
const outputTeams = ref<string[]>(
  properties.scoutingResult?.outputs?.teams ?? [],
);

watch(
  () => properties.scoutingResult,
  () => {
    teams.value = properties.scoutingResult?.teams ?? [];
    outputTeams.value = properties.scoutingResult?.outputs?.teams ?? [];
  },
);

const filteredTeams = ref<Team[]>([]);
const filteredOutputTeams = ref<string[]>([]);

const change = (searchedTeams: Team[], searchedOutputs: string[]) => {
  filteredTeams.value = searchedTeams;
  filteredOutputTeams.value = searchedOutputs;
  teams.value = filteredTeams.value;
  outputTeams.value = filteredOutputTeams.value;
};

const defaultRepresentation = {
  text: "Visual Representation",
  value: "VisualRepresentation",
};
const selectedRepresentation = ref(defaultRepresentation.value);

const searchActive = computed(() => {
  return (
    !selectedRepresentation.value.includes("GraphStatistics") &&
    !selectedRepresentation.value.includes("MoveByPokemonStatistics") &&
    !selectedRepresentation.value.includes("ItemByPokemonStatistics")
  );
});

const representationOptionsVisible = computed(() => {
  return selectedRepresentation.value.includes("Representation");
});

watch(representationOptionsVisible, () => {
  if (!representationOptionsVisible.value) {
    teams.value = filteredTeams.value;
    outputTeams.value = filteredOutputTeams.value;
  }
});

const changePage = (pagedTeams: Team[], pagedOutputs: string[]) => {
  if (representationOptionsVisible.value) {
    teams.value = pagedTeams;
    outputTeams.value = pagedOutputs;
  }
};

// Implement moves & teammates per Pokémon, Combos & Leads
const representations = [
  { text: "List Representation", value: "ListRepresentation" },
  { text: "Raw Representation", value: "RawRepresentation" },
  { text: "Text Representation", value: "TextRepresentation" },
  { text: "Table Representation", value: "TableRepresentation" },
  defaultRepresentation,
  { text: "Pokémon Statistics (Table)", value: "PokemonStatistics" },
  { text: "Combos Statistics (Table)", value: "CombosStatisticsWithoutLeads" },
  {
    text: "Combos Statistics With Leads (Table)",
    value: "CombosStatisticsWithLeads",
  },
  { text: "Graph Statistics", value: "GraphStatistics" },
  { text: "Item Statistics (Table)", value: "ItemStatistics" },
  {
    text: "Item by Pokémon Statistics (Table)",
    value: "ItemByPokemonStatistics",
  },
  { text: "Lead Statistics (Table)", value: "LeadStatistics" },
  { text: "Move Statistics (Table)", value: "MoveStatistics" },
  {
    text: "Move by Pokémon Statistics (Table)",
    value: "MoveByPokemonStatistics",
  },
];

const showSearch = ref(true);

const switchSearch = () => {
  showSearch.value = !showSearch.value;
  emit("switchSearch", showSearch.value);
};

defineExpose({
  change,
  selectedRepresentation,
  showSearch,
  switchSearch,
  teams,
  outputTeams,
});
</script>
