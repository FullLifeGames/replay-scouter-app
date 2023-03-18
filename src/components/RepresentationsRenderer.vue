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
    <div v-if="props.scoutingResult !== null">
      <hr />
      <SearchQuery
        :scouting-result="props.scoutingResult"
        :sorting-active="selectedRepresentation.includes('Representation')"
        @change="change"
      />
      <TextRepresentation
        v-if="selectedRepresentation === 'TextRepresentation'"
        :scouting-result="props.scoutingResult"
        :teams="teams"
        :output-teams="outputTeams"
      />
      <TableRepresentation
        v-if="selectedRepresentation === 'TableRepresentation'"
        :scouting-result="props.scoutingResult"
        :teams="teams"
        :output-teams="outputTeams"
      />
      <VisualRepresentation
        v-if="selectedRepresentation === 'VisualRepresentation'"
        :scouting-result="props.scoutingResult"
        :teams="teams"
        :output-teams="outputTeams"
      />
      <PokemonStatistics
        v-if="selectedRepresentation === 'PokemonStatistics'"
        :scouting-result="props.scoutingResult"
        :teams="teams"
        :output-teams="outputTeams"
      />
      <CombosStatisticsWithoutLeads
        v-if="selectedRepresentation === 'CombosStatisticsWithoutLeads'"
        :scouting-result="props.scoutingResult"
        :teams="teams"
        :output-teams="outputTeams"
      />
      <CombosStatisticsWithLeads
        v-if="selectedRepresentation === 'CombosStatisticsWithLeads'"
        :scouting-result="props.scoutingResult"
        :teams="teams"
        :output-teams="outputTeams"
      />
      <ItemStatistics
        v-if="selectedRepresentation === 'ItemStatistics'"
        :scouting-result="props.scoutingResult"
        :teams="teams"
        :output-teams="outputTeams"
      />
      <LeadStatistics
        v-if="selectedRepresentation === 'LeadStatistics'"
        :scouting-result="props.scoutingResult"
        :teams="teams"
        :output-teams="outputTeams"
      />
      <MoveStatistics
        v-if="selectedRepresentation === 'MoveStatistics'"
        :scouting-result="props.scoutingResult"
        :teams="teams"
        :output-teams="outputTeams"
      />
      <RawRepresentation
        v-if="selectedRepresentation === 'RawRepresentation'"
        :scouting-result="props.scoutingResult"
        :teams="teams"
        :output-teams="outputTeams"
      />
      <PasteRepresentation
        v-if="selectedRepresentation === 'PasteRepresentation'"
        :scouting-result="props.scoutingResult"
        :teams="teams"
        :output-teams="outputTeams"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ApiScoutingResult, Team } from "@/api";

const props = defineProps<{
  scoutingResult: ApiScoutingResult | null;
}>();

const emit = defineEmits<{
  (event: "switchSearch", showSearch: boolean): void;
}>();

const teams = ref(props.scoutingResult?.teams ?? ([] as Team[]));
const outputTeams = ref(
  props.scoutingResult?.outputs?.teams ?? ([] as string[])
);

watch(
  () => props.scoutingResult,
  () => {
    teams.value = props.scoutingResult?.teams ?? [];
    outputTeams.value = props.scoutingResult?.outputs?.teams ?? [];
  }
);

const change = (searchedTeams: Team[], searchedOutputs: string[]) => {
  teams.value = searchedTeams;
  outputTeams.value = searchedOutputs;
};

const defaultRepresentation = {
  text: "Visual Representation",
  value: "VisualRepresentation",
};
const selectedRepresentation = ref(defaultRepresentation.value);

// Implement moves & teammates per Pokémon, Combos & Leads
const representations = [
  { text: "Raw Representation", value: "RawRepresentation" },
  { text: "Text Representation", value: "TextRepresentation" },
  { text: "Table Representation", value: "TableRepresentation" },
  { text: "Paste Representation", value: "PasteRepresentation" },
  defaultRepresentation,
  { text: "Pokémon Statistics (Table)", value: "PokemonStatistics" },
  { text: "Combos Statistics (Table)", value: "CombosStatisticsWithoutLeads" },
  {
    text: "Combos Statistics With Leads (Table)",
    value: "CombosStatisticsWithLeads",
  },
  { text: "Item Statistics (Table)", value: "ItemStatistics" },
  { text: "Lead Statistics (Table)", value: "LeadStatistics" },
  { text: "Move Statistics (Table)", value: "MoveStatistics" },
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
