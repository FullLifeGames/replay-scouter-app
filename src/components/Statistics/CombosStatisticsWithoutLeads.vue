<template>
  <CombosStatistics
    :scouting-result="scoutingResult"
    :show-leads="false"
    :teams="teams"
  />
</template>

<script setup lang="ts">
import type { ApiScoutingResult, Team } from "@/api";

const properties = defineProps<{
  scoutingResult: ApiScoutingResult | null;
  teams: Team[];
}>();
</script>
