<template>
  <div>
    <b-form-textarea v-if="teamsRaw !== ''" v-model="teamsRaw" rows="36" />
  </div>
</template>

<script setup lang="ts">
import type { Team } from "@/api";

const props = defineProps<{
  teams: Team[];
}>();

const teamsRaw = computed(() => {
  if (props.teams) {
    return JSON.stringify(props.teams);
  }
  return "";
});
</script>
