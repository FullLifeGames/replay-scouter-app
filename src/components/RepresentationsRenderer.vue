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
      <TextRepresentation
        v-if="selectedRepresentation === 'TextRepresentation'"
        :scouting-result="props.scoutingResult"
      />
      <TableRepresentation
        v-if="selectedRepresentation === 'TableRepresentation'"
        :scouting-result="props.scoutingResult"
      />
      <VisualRepresentation
        v-if="selectedRepresentation === 'VisualRepresentation'"
        :scouting-result="props.scoutingResult"
      />
      <PokemonStatistics
        v-if="selectedRepresentation === 'PokemonStatistics'"
        :scouting-result="props.scoutingResult"
      />
      <CombosStatistics
        v-if="selectedRepresentation === 'CombosStatistics'"
        :scouting-result="props.scoutingResult"
      />
      <ItemStatistics
        v-if="selectedRepresentation === 'ItemStatistics'"
        :scouting-result="props.scoutingResult"
      />
      <MoveStatistics
        v-if="selectedRepresentation === 'MoveStatistics'"
        :scouting-result="props.scoutingResult"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ApiScoutingResult } from "@/api";

const props = defineProps<{
  scoutingResult: ApiScoutingResult | null;
}>();

const emit = defineEmits<{
  (event: "switchSearch", showSearch: boolean): void;
}>();

// TODO: Accept requests from TournamentTeamCollector and display them (list of replays)

// Implement moves & teammates per Pokémon, Combos & Leads
const representations = [
  { text: "Text Representation", value: "TextRepresentation" },
  { text: "Table Representation", value: "TableRepresentation" },
  { text: "Visual Representation", value: "VisualRepresentation" },
  { text: "Pokémon Statistics (Table)", value: "PokemonStatistics" },
  { text: "Combos Statistics (Table)", value: "CombosStatistics" },
  { text: "Item Statistics (Table)", value: "ItemStatistics" },
  { text: "Move Statistics (Table)", value: "MoveStatistics" },
];
const selectedRepresentation = ref(representations[2].value);

const showSearch = ref(true);

const switchSearch = () => {
  showSearch.value = !showSearch.value;
  emit("switchSearch", showSearch.value);
};
</script>
