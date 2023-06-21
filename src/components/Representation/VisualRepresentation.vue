<template>
  <div v-if="teams && outputTeams">
    <b-accordion class="mb-2">
      <b-accordion-item v-for="(team, index) in teams" :key="index">
        <template #title>
          <span
            v-for="(pokemon, pokemonIndex) in team.pokemon"
            :key="pokemonIndex"
            class="iconEntry"
          >
            <IconRenderer :name="pokemon.name" />
            <ItemRenderer class="renderedItem" :name="pokemon.item" />
          </span>
        </template>
        <pre v-dompurify-html:a="linkify(outputTeams[index])" />
      </b-accordion-item>
    </b-accordion>
  </div>
</template>

<script setup lang="ts">
import type { ApiScoutingResult, Team } from "@/api";
import { linkify } from "@/util/linkify";

defineProps<{
  scoutingResult: ApiScoutingResult | null;
  teams: Team[];
  outputTeams: string[];
}>();
</script>

<style scoped>
.accordion-item :deep(.accordion-button) {
  display: block !important;
  text-align: center !important;
}
.accordion-item :deep(.accordion-button::after) {
  position: absolute;
  z-index: 100;
  right: 1.2rem;
  top: 1.4rem;
}
.iconEntry {
  width: 46px;
  min-width: 46px;
  display: inline-block;
}
.renderedItem {
  margin-left: -18px;
  margin-bottom: -9px;
}
</style>
