<template>
  <div>
    <MonTable :scouting-result="props.scoutingResult" :teams="teams" />
  </div>
</template>

<script setup lang="ts">
import type { ApiScoutingResult, Team } from "@/api";

const props = defineProps<{
  scoutingResult: ApiScoutingResult | null;
  teams: Team[];
}>();
</script>
