<template>
  <div v-if="teams && outputTeams && linkedOutput">
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
        <pre v-dompurify-html:a="linkedOutput[index]" />
        <b-button @click="fillBuild(team, index)">Fill Build</b-button>
      </b-accordion-item>
    </b-accordion>
  </div>
</template>

<script setup lang="ts">
import type { ApiScoutingResult, Team } from "@/api";
import { retrieveSmogonDumpEntry } from "@/util/dumpHelper";
import { linkify } from "@/util/linkify";
import { teamToText } from "@/util/textHelper";
import useEmitter from "@/plugins/emitter";
import { findMostSimilarPokemon } from "@/util/similarityHelper";

const emitter = useEmitter();

const properties = defineProps<{
  scoutingResult: ApiScoutingResult | null;
  teams: Team[];
  outputTeams: string[];
}>();

const emits = defineEmits<{
  (event: "change", teams: Team[], outputs: string[]): void;
}>();

const getLinkedOutput = (outputTeams: string[]) => {
  return outputTeams.map((x) => linkify(x));
};

const linkedOutput = ref<string[]>(getLinkedOutput(properties.outputTeams));

watch(properties.outputTeams, () => {
  linkedOutput.value = getLinkedOutput(properties.outputTeams);
});

const fillBuild = async (team: Team, currentIndex: number) => {
  if (!team.replays || !team.replays[0] || !team.pokemon) {
    return;
  }

  const replay = team.replays[0];

  if (!replay.format) {
    return;
  }

  const format = replay.format;

  if (!format.includes("gen")) {
    return;
  }

  emitter.emit("asyncComponentLoading");

  const [teams, _] = await retrieveSmogonDumpEntry(format + ".json");

  for (let index = 0; index < team.pokemon.length; index++) {
    const mon = team.pokemon[index];
    const closestMon = findMostSimilarPokemon(mon, teams);

    if (closestMon) {
      team.pokemon[index] = closestMon;
    }
  }

  const currentTeams = [...properties.teams];
  const currentOutputTeams = [...properties.outputTeams];

  currentTeams[currentIndex] = team;
  currentOutputTeams[currentIndex] = teamToText(team);
  linkedOutput.value = getLinkedOutput(currentOutputTeams);

  emitter.emit("asyncComponentLoaded");

  emits("change", currentTeams, currentOutputTeams);
};
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
