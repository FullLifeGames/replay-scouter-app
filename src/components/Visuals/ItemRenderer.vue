<template>
  <span v-if="icon" :style="icon.style" />
</template>

<script setup lang="ts">
import { Icons } from "@pkmn/img";
const props = defineProps<{
  name?: string | null;
}>();
const icon = computed(() => {
  if (props.name) {
    return Icons.getItem(props.name);
  }
});
</script>
