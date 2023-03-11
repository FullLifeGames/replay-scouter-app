<template>
  <div>
    <b-form-textarea
      v-if="scoutingResultRaw !== ''"
      v-model="scoutingResultRaw"
      rows="36"
    />
  </div>
</template>

<script setup lang="ts">
import type { ApiScoutingResult } from "@/api";

const props = defineProps<{
  scoutingResult: ApiScoutingResult | null;
  outputTeams: string[];
}>();

const scoutingResultRaw = computed(() => {
  if (
    props.scoutingResult &&
    props.scoutingResult.outputs &&
    props.outputTeams
  ) {
    return (
      props.scoutingResult.outputs.header +
      "\n\n" +
      props.outputTeams.join("\n\n\n")
    );
  }
  return "";
});
</script>
