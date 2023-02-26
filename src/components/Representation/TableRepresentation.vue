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
}>();

const scoutingResultRaw = computed(() => {
  if (
    props.scoutingResult &&
    props.scoutingResult.outputs &&
    props.scoutingResult.outputs.teams
  ) {
    return (
      props.scoutingResult.outputs.header +
      "\n\n" +
      props.scoutingResult.outputs.teams.join("\n\n\n")
    );
  }
  return "";
});
</script>
