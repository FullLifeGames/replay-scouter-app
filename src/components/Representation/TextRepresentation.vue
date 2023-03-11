<template>
  <div>
    <SearchQuery :scouting-result="props.scoutingResult" @change="change" />
    <b-form-textarea
      v-if="scoutingResultRaw !== ''"
      v-model="scoutingResultRaw"
      rows="36"
    />
  </div>
</template>

<script setup lang="ts">
import type { ApiScoutingResult, Team } from "@/api";

const props = defineProps<{
  scoutingResult: ApiScoutingResult | null;
}>();

const teams = ref(props.scoutingResult?.teams ?? ([] as Team[]));
const outputTeams = ref(
  props.scoutingResult?.outputs?.teams ?? ([] as string[])
);

const change = (searchedTeams: Team[], searchedOutputs: string[]) => {
  teams.value = searchedTeams;
  outputTeams.value = searchedOutputs;
};

const scoutingResultRaw = computed(() => {
  if (
    props.scoutingResult &&
    props.scoutingResult.outputs &&
    outputTeams.value
  ) {
    return (
      props.scoutingResult.outputs.header +
      "\n\n" +
      outputTeams.value.join("\n\n\n")
    );
  }
  return "";
});
</script>
