<template>
  <div>
    <b-form-group
      class="mb-3"
      label-class="fw-bold pt-0"
      label="Smogon Tournaments"
      label-for="tournament-input"
      description="Search for Smogon Tournaments"
    >
      <SearchSelect
        v-model="selectedOptions"
        :options="options"
        placeholder="Search for Smogon Tournaments"
        :taggable="false"
      />
    </b-form-group>
    <b-form-group
      class="mb-3"
      label-class="fw-bold pt-0"
      label="Tournament Link List"
      label-for="links-input"
      description="Enter Tournament Links"
    >
      <b-input-group>
        <b-form-textarea
          id="links-input"
          v-model="links"
          placeholder="Optional: List of links (separate by new line)"
          aria-describedby="input-live-feedback"
          :state="errors.length > 0 ? false : null"
        ></b-form-textarea>
        <b-form-invalid-feedback
          v-if="errors.length > 0"
          id="input-live-feedback"
        >
          The following values are not valid: "{{ errors.join(", ") }}"
        </b-form-invalid-feedback>
      </b-input-group>
    </b-form-group>
    <div class="d-grid gap-2">
      <button
        class="btn btn-secondary"
        type="button"
        :disabled="
          loading || (selectedOptions.length === 0 && links.trim() === '')
        "
        @click="scout"
      >
        Visualize Smogon Tournaments
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { type ApiScoutingResult } from "@/api";
import useEmitter from "@/plugins/emitter";
import type { SearchSelectedOption } from "@/types/searchSelectedOption";
import { filterSearchValue } from "@/util/linkHelper";
import { lowerCaseObjectKeys } from "@/util/lower";

const emit = defineEmits<{
  (event: "scouting", scoutingResult: ApiScoutingResult): void;
}>();

const emitter = useEmitter();

const loading = ref(true);

const selectedOptions = ref<SearchSelectedOption[]>([]);
const links = ref("");

const errors = ref<string[]>([]);

emitter.emit("asyncComponentLoading");
const options = ref<SearchSelectedOption[]>([]);

onMounted(async () => {
  const result = await fetch(
    "https://fulllifegames.com/Tools/TournamentTeams/Tournaments/outputJustThreads.json",
  );
  const jsonResult = await result.json();
  const givenOptions = Object.values(jsonResult) as typeof options.value;
  options.value.length = 0;
  options.value.push(...givenOptions.sort((a, b) => a.n.localeCompare(b.n)));
  emitter.emit("asyncComponentLoaded");
  loading.value = false;
});

const scout = async () => {
  if (
    (selectedOptions.value && selectedOptions.value.length > 0) ||
    links.value.trim() !== ""
  ) {
    loading.value = true;
    emitter.emit("asyncComponentLoading");

    errors.value = [];

    const combinedApiScoutingResult: ApiScoutingResult = {
      outputs: { header: "", teams: [] },
      teams: [],
    };

    const analyzingOptions = [...selectedOptions.value] ?? [];
    for (const link of links.value.split("\n")) {
      const filteredLink = link.trim();
      if (filteredLink !== "") {
        const id = filterSearchValue(filteredLink);
        if (id === "") {
          errors.value.push(link);
        } else {
          analyzingOptions.push({ i: id, n: link, l: false });
        }
      }
    }

    if (errors.value.length > 0) {
      loading.value = false;
      emitter.emit("asyncComponentLoaded");
      emit("scouting", combinedApiScoutingResult);
      return;
    }

    for (const selectedOption of analyzingOptions) {
      try {
        const result = await fetch(
          `https://fulllifegames.com/Tools/TournamentTeams/Tournaments/${selectedOption.i}.json`,
        );
        const jsonResult = await result.json();
        const scoutingResult: ApiScoutingResult =
          lowerCaseObjectKeys(jsonResult);

        if (
          combinedApiScoutingResult.outputs &&
          typeof combinedApiScoutingResult.outputs.header === "string" &&
          combinedApiScoutingResult.outputs.teams &&
          scoutingResult.outputs &&
          typeof scoutingResult.outputs.header === "string" &&
          scoutingResult.outputs.teams &&
          combinedApiScoutingResult.teams &&
          scoutingResult.teams
        ) {
          combinedApiScoutingResult.outputs.header +=
            scoutingResult.outputs.header;
          combinedApiScoutingResult.outputs.teams.push(
            ...scoutingResult.outputs.teams,
          );
          combinedApiScoutingResult.teams.push(...scoutingResult.teams);
        }
      } catch {
        errors.value.push(selectedOption.n);
      }
    }

    loading.value = false;
    emitter.emit("asyncComponentLoaded");
    emit("scouting", combinedApiScoutingResult);
  }
};
</script>
