<template>
  <div>
    <b-collapse id="collapse-search" v-model="showSearch">
      <SearchMask @scouting="scouting" />
      <hr />
    </b-collapse>
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
    <div v-if="scoutingResult !== null">
      <hr />
      <TextRepresentation
        v-if="selectedRepresentation === 'TextRepresentation'"
        :scouting-result="scoutingResult"
      />
      <TableRepresentation
        v-if="selectedRepresentation === 'TableRepresentation'"
        :scouting-result="scoutingResult"
      />
      <VisualRepresentation
        v-if="selectedRepresentation === 'VisualRepresentation'"
        :scouting-result="scoutingResult"
      />
      <PokemonStatistics
        v-if="selectedRepresentation === 'PokemonStatistics'"
        :scouting-result="scoutingResult"
      />
      <ItemStatistics
        v-if="selectedRepresentation === 'ItemStatistics'"
        :scouting-result="scoutingResult"
      />
      <MoveStatistics
        v-if="selectedRepresentation === 'MoveStatistics'"
        :scouting-result="scoutingResult"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ApiScoutingResult } from "@/api";

const scoutingResult = ref(null as ApiScoutingResult | null);

// TODO: Accept GET & POST parameters same as old ReplayScouter and trigger the scouting, if set

// TODO: Accept requests from TournamentTeamCollector and display them (list of replays)

// Implement moves & teammates per Pokémon, Combos & Leads
// Implement the Pokémon Stats Table, but nicer
// Implement the regular visualization
// Implement the old stats? Think about if necessary
const representations = [
  { text: "Text Representation", value: "TextRepresentation" },
  // TODO
  { text: "Table Representation", value: "TableRepresentation" },
  // TODO
  { text: "Visual Representation", value: "VisualRepresentation" },
  { text: "Pokémon Statistics (Table)", value: "PokemonStatistics" },
  //{ text: "Pokémon Statistics (Visual)", value: "PokemonStatistics" },
  { text: "Item Statistics (Table)", value: "ItemStatistics" },
  { text: "Move Statistics (Table)", value: "MoveStatistics" },
];
const selectedRepresentation = ref(representations[2].value);

const showSearch = ref(true);

const scouting = (scoutingResultParam: ApiScoutingResult) => {
  scoutingResult.value = scoutingResultParam;
};

const switchSearch = () => {
  showSearch.value = !showSearch.value;
};
</script>
