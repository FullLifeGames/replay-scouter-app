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

const properties = defineProps<{
  scoutingResult: ApiScoutingResult | null;
  outputTeams: string[];
}>();

const scoutingResultRaw = computed(() => {
  if (
    properties.scoutingResult &&
    properties.scoutingResult.outputs &&
    properties.outputTeams
  ) {
    return `${
      properties.scoutingResult.outputs.header
    }\n\n${properties.outputTeams.join("\n\n\n")}`;
  }
  return "";
});
</script>
