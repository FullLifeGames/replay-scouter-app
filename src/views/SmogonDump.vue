<template>
  <div>
    <b-collapse id="collapse-search" v-model="showSearch">
      <DumpSearchMask @scouting="scouting" />
      <hr />
    </b-collapse>
    <RepresentationsRenderer
      :complete="true"
      :scouting-result="scoutingResult"
      @switch-search="switchSearch"
    />
  </div>
</template>

<script setup lang="ts">
import type { ApiScoutingResult } from "@/api";

const scoutingResult = ref(null as ApiScoutingResult | null);

const showSearch = ref(true);

const scouting = (scoutingResultParameter: ApiScoutingResult) => {
  scoutingResult.value = scoutingResultParameter;
};

const switchSearch = () => {
  showSearch.value = !showSearch.value;
};
</script>
