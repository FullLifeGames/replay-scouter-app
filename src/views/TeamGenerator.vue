<template>
  <div>
    <b-collapse id="collapse-search" v-model="showSearch">
      <b-form-group
        class="mb-3"
        label-class="fw-bold pt-0"
        label="Metagame"
        label-for="dump-input"
        description="Select the metagame you want to generate a team for"
      >
        <SearchSelect
          v-model="selectedOption"
          :options="options"
          placeholder="Select the metagame you want to generate a team for (e.g. gen7ou)"
          :single="true"
          :taggable="false"
        />
      </b-form-group>
      <b-form-group
        class="mb-3"
        label-class="fw-bold pt-0"
        label="Number Of Random Teams"
        label-for="random-teams-input"
        description="Input how many random teams should be tested (be careful of high values)"
      >
        <b-form-input
          id="random-teams-input"
          v-model="randomizeAttempts"
          type="number"
        ></b-form-input>
      </b-form-group>

      <b-button :disabled="loading || !selectedOption" @click="calculateTeam"
        >Generate Team</b-button
      >

      <hr />
    </b-collapse>
    <RepresentationsRenderer
      v-if="calculationResult"
      :complete="true"
      :scouting-result="calculationResult"
      @switch-search="switchSearch"
    />
  </div>
</template>

<script setup lang="ts">
import type { ApiScoutingResult, Pokemon, Team } from "@/api";
import { retrieveSmogonDumpEntry } from "@/util/dumpHelper";
import { getGeneration, rateTeam, toRealPokemon } from "@/util/ratingHelper";
import { findMostSimilarPokemon } from "@/util/similarityHelper";
import { Pokemon as RealPokemon } from "@smogon/calc";
import { teamToText } from "@/util/textHelper";
import type { SearchSelectedOption } from "@/types/searchSelectedOption";
import useEmitter from "@/plugins/emitter";

const emitter = useEmitter();

const loading = ref(true);

const selectedOption = ref<SearchSelectedOption | null>(null);

emitter.emit("asyncComponentLoading");
const options = ref<SearchSelectedOption[]>([]);

onMounted(async () => {
  const result = await fetch(
    "https://fulllifegames.com/Tools/SmogonDump/list.php",
  );
  const givenOptions: string[] = await result.json();
  options.value.length = 0;
  options.value.push(
    ...givenOptions.map((givenOption) => {
      return {
        i: givenOption,
        n: givenOption.replace(".json", ""),
        l: false,
      };
    }),
  );
  emitter.emit("asyncComponentLoaded");
  loading.value = false;
});

const randomizeAttempts = ref(3);

const calculationResult = ref<ApiScoutingResult>({});
const teams = ref<Team[]>([]);
const outputTeams = ref<string[]>([]);

const calculateTeam = async () => {
  if (!selectedOption.value) {
    return;
  }
  loading.value = true;
  emitter.emit("asyncComponentLoading");

  const format = selectedOption.value.i;
  const [dumpTeams, _] = await retrieveSmogonDumpEntry(format);

  const gen = getGeneration(Number(format.slice(3, 4)));

  const dumpMons: Pokemon[] = [];
  for (const team of dumpTeams) {
    if (!team.pokemon) {
      continue;
    }
    for (const mon of team.pokemon) {
      const [_, otherClosestSimilarities] = findMostSimilarPokemon(
        mon,
        dumpMons,
      );
      // Avoid duplicates
      if (otherClosestSimilarities < 9) {
        dumpMons.push(mon);
      }
    }
  }
  const dumpRealMons = dumpMons
    .map((p) => toRealPokemon(p, gen))
    .filter((x) => x !== null) as RealPokemon[];

  let bestScore = 0;
  let bestTeam: Team | null = null;
  for (let index = 0; index < randomizeAttempts.value; index++) {
    const randomizedMons = dumpMons
      .map((x) => ({ x, r: Math.random() }))
      .sort((a, b) => a.r - b.r)
      .map((a) => a.x);
    const randomizedTeamMons: Pokemon[] = [];
    for (const randomizedMon of randomizedMons) {
      if (randomizedTeamMons.length === 6) {
        break;
      }
      const realPokemon = toRealPokemon(randomizedMon, gen);
      if (realPokemon === null) {
        continue;
      }
      // Species Clause
      if (!randomizedTeamMons.some((x) => x.name === randomizedMon.name)) {
        randomizedTeamMons.push(randomizedMon);
      }
    }
    const team: Team = {
      complete: true,
      pokemon: randomizedTeamMons.sort((a, b) =>
        ((a.lead ? "(Lead) " : "") + (a.name ?? "")).localeCompare(
          (b.lead ? "(Lead) " : "") + (b.name ?? ""),
        ),
      ),
    };
    const beatScore = rateTeam(team, dumpRealMons, gen);
    if (beatScore > bestScore) {
      bestScore = beatScore;
      bestTeam = team;
    }
  }

  if (bestTeam) {
    teams.value.unshift(bestTeam);
    calculationResult.value.teams = teams.value;
    outputTeams.value.unshift(teamToText(bestTeam));
    calculationResult.value.outputs = {
      header: "Best Generated Team with a score: " + bestScore,
      teams: outputTeams.value,
    };
  }

  emitter.emit("asyncComponentLoaded");
  loading.value = false;
};

const showSearch = ref(true);
const switchSearch = () => {
  showSearch.value = !showSearch.value;
};
</script>
