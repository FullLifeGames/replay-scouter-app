<template>
  <div>
    <b-form-textarea v-if="paste !== ''" v-model="paste" rows="36" />
  </div>
</template>

<script setup lang="ts">
import type { Team } from "@/api";

const props = defineProps<{
  teams: Team[];
}>();

const paste = computed(() => {
  if (props.teams) {
    let pokepaste = "";
    for (let i = 0; i < props.teams.length; i++) {
      pokepaste += "=== [" + props.teams[i].replays[i].format + "] ===\n";
      const rawpokemon = props.teams[i].pokemon;
      pokepaste += rawpokemon[i].name;
      if (rawpokemon[i].item !== "" || rawpokemon[i].item !== undefined) {
        pokepaste += " @ " + rawpokemon[i].item + "\n";
      } else {
        pokepaste += "\n\n";
      }
      pokepaste += "Ability: " + rawpokemon[i].ability + "\n";
      for (let k = 0; k < rawpokemon[i].moves.length; k++) {
        pokepaste += "- " + rawpokemon[i].moves[k] + "\n";
      }
      pokepaste += "\n\n";
    }
    return pokepaste;
  }
return "";
});
</script>