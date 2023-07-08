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
    <div class="d-grid gap-2">
      <button
        class="btn btn-secondary"
        type="button"
        :disabled="loading || selectedOptions.length === 0"
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
import { lowerCaseObjectKeys } from "@/util/lower";

const emit = defineEmits<{
  (event: "scouting", scoutingResult: ApiScoutingResult): void;
}>();

const emitter = useEmitter();

const loading = ref(true);

const selectedOptions: Ref<SearchSelectedOption[]> = ref([]);

emitter.emit("asyncComponentLoading");
const options: Ref<SearchSelectedOption[]> = ref([]);

onMounted(async () => {
  const givenOptions = Object.values(
    await (
      await fetch(
        "https://fulllifegames.com/Tools/TournamentTeams/Tournaments/outputJustThreads.json",
      )
    ).json(),
  ) as typeof options.value;
  options.value.length = 0;
  options.value.push(...givenOptions.sort((a, b) => a.n.localeCompare(b.n)));
  emitter.emit("asyncComponentLoaded");
  loading.value = false;
});

const scout = async () => {
  if (selectedOptions.value && selectedOptions.value.length) {
    loading.value = true;
    emitter.emit("asyncComponentLoading");

    const combinedApiScoutingResult: ApiScoutingResult = {
      outputs: { header: "", teams: [] },
      teams: [],
    };

    for (const selectedOption of selectedOptions.value) {
      const scoutingResult: ApiScoutingResult = lowerCaseObjectKeys(
        await (
          await fetch(
            "https://fulllifegames.com/Tools/TournamentTeams/Tournaments/" +
              selectedOption.i +
              ".json",
          )
        ).json(),
      );

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
    }

    loading.value = false;
    emitter.emit("asyncComponentLoaded");
    emit("scouting", combinedApiScoutingResult);
  }
};
</script>
