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

const representations = [
  { text: "Text Representation", value: "TextRepresentation" },
  { text: "Pokémon Statistics", value: "PokemonStatistics" },
  { text: "Item Statistics", value: "ItemStatistics" },
  { text: "Move Statistics", value: "MoveStatistics" },
];
const selectedRepresentation = ref(representations[1].value);

const showSearch = ref(true);

const scouting = (scoutingResultParam: ApiScoutingResult) => {
  scoutingResult.value = scoutingResultParam;
};

const switchSearch = () => {
  showSearch.value = !showSearch.value;
};
</script>
