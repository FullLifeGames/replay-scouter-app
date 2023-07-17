<template>
  <div>
    <b-form-textarea v-if="teamsRaw !== ''" v-model="teamsRaw" rows="36" />
  </div>
</template>

<script setup lang="ts">
import type { Team } from "@/api";

const properties = defineProps<{
  teams: Team[];
}>();

const teamsRaw = computed(() => {
  if (properties.teams) {
    return JSON.stringify(properties.teams);
  }
  return "";
});
</script>
