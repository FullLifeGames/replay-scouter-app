<template>
  <CombosStatistics
    :scouting-result="props.scoutingResult"
    :show-leads="true"
    :teams="props.teams"
  />
</template>

<script setup lang="ts">
import type { ApiScoutingResult, Team } from "@/api";

const props = defineProps<{
  scoutingResult: ApiScoutingResult | null;
  teams: Team[];
}>();
</script>
