<template>
  <div>
    <MonTable :scouting-result="scoutingResult" :teams="teams" />
  </div>
</template>

<script setup lang="ts">
import type { ApiScoutingResult, Team } from "@/api";

const properties = defineProps<{
  scoutingResult: ApiScoutingResult | null;
  teams: Team[];
}>();
</script>
