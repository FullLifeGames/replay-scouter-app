<template>
  <div>
    <b-collapse id="collapse-search" v-model="showSearch">
      <DumpSearchMask @scouting="scouting" />
      <hr />
    </b-collapse>
    <RepresentationsRenderer
      :scouting-result="scoutingResult"
      @switchSearch="switchSearch"
    />
  </div>
</template>

<script setup lang="ts">
import type { ApiScoutingResult } from "@/api";

const scoutingResult = ref(null as ApiScoutingResult | null);

const showSearch = ref(true);

const scouting = (scoutingResultParam: ApiScoutingResult) => {
  scoutingResult.value = scoutingResultParam;
};

const switchSearch = () => {
  showSearch.value = !showSearch.value;
};
</script>
