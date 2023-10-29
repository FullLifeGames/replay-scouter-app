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
        <b-button
          v-if="!complete && !team.complete"
          @click="fillBuild(team, index)"
          >Fill Build</b-button
        >
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
import {
  adaptWithClosestMon,
  findMostSimilarPokemonWithTeams,
} from "@/util/similarityHelper";

const emitter = useEmitter();

const properties = defineProps<{
  complete: boolean | undefined;
  scoutingResult: ApiScoutingResult | null;
  teams: Team[];
  outputTeams: string[];
}>();

const teams = ref<Team[]>(JSON.parse(JSON.stringify(properties.teams)));
const outputTeams = ref<string[]>(
  JSON.parse(JSON.stringify(properties.outputTeams)),
);

watch(
  () => properties.teams,
  () => {
    teams.value = JSON.parse(JSON.stringify(properties.teams));
  },
);

watch(
  () => properties.outputTeams,
  () => {
    outputTeams.value = JSON.parse(JSON.stringify(properties.outputTeams));
  },
);

const fillBuild = async (team: Team, currentIndex: number) => {
  if (!team.replays || !team.replays[0] || !team.pokemon) {
    return;
  }

  const replay = team.replays[0];

  if (!replay.formatId) {
    return;
  }

  const format = replay.formatId;

  if (!format.includes("gen")) {
    return;
  }

  emitter.emit("asyncComponentLoading");

  const [dumpTeams, _] = await retrieveSmogonDumpEntry(format + ".json");

  for (let index = 0; index < team.pokemon.length; index++) {
    const mon = team.pokemon[index];
    const closestMon = findMostSimilarPokemonWithTeams(mon, dumpTeams);

    if (closestMon) {
      adaptWithClosestMon(mon, closestMon);
      team.pokemon[index] = mon;
    }
  }

  team.complete = true;

  teams.value[currentIndex] = team;
  outputTeams.value[currentIndex] = teamToText(team);

  emitter.emit("asyncComponentLoaded");
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
