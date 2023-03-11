<template>
  <span v-if="icon" :style="icon.style" />
</template>

<script setup lang="ts">
import { Icons } from "@pkmn/img";
const props = defineProps<{
  name: string | null | undefined;
}>();
const icon = computed(() => {
  if (props.name) {
    return Icons.getPokemon(props.name);
  }
});
</script>
