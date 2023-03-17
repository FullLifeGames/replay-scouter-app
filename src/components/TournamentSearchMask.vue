<template>
  <div>
    <b-form-group
      label-class="fw-bold pt-0"
      label="Smogon Tournaments"
      label-for="tournament-input"
      description="Search for Smogon Tournaments"
    >
      <v-select
        id="tournament-input"
        v-model="selectedOptions"
        :filterable="false"
        multiple
        :options="paginated"
        placeholder="Search for Smogon Tournaments"
        label="n"
        @search="searchTrigger"
      >
        <template #list-footer>
          <li class="pagination">
            <button :disabled="!hasPrevPage" @click="offset -= limit">
              Prev
            </button>
            <button :disabled="!hasNextPage" @click="offset += limit">
              Next
            </button>
          </li>
        </template></v-select
      >
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
import { lowerCaseObjectKeys } from "@/util/lower";
import { useDebounceFn } from "@vueuse/core";
import Fuse from "fuse.js";

const emit = defineEmits<{
  (event: "scouting", scoutingResult: ApiScoutingResult): void;
}>();

const emitter = useEmitter();

const loading = ref(true);

const offset = ref(0);
const limit = ref(10);

const selectedOptions = ref([] as { i: string; n: string; l: boolean }[]);

emitter.emit("asyncComponentLoading");
const options = ref([] as { i: string; n: string; l: boolean }[]);
const selectableOptions = ref([] as { i: string; n: string; l: boolean }[]);

const paginated = computed(() => {
  return selectableOptions.value.slice(
    offset.value,
    limit.value + offset.value
  );
});

watch(options, () => (selectableOptions.value = options.value));

onMounted(async () => {
  const givenOptions = Object.values(
    await (
      await fetch(
        "https://fulllifegames.com/Tools/TournamentTeams/Tournaments/outputJustThreads.json"
      )
    ).json()
  ) as typeof options.value;
  options.value = givenOptions.sort((a, b) => a.n.localeCompare(b.n));
});

const searchVar = ref("");
const loadingVar = ref(null as ((load: boolean) => void) | null);

const fuseSearch = useDebounceFn(() => {
  if (loadingVar.value !== null) {
    loadingVar.value(true);
    emitter.emit("asyncComponentLoading");
    const fuse = new Fuse(options.value, {
      keys: ["i", "n"],
      shouldSort: true,
    });
    selectableOptions.value = searchVar.value.length
      ? fuse.search(searchVar.value).map(({ item }) => item)
      : options.value;
    offset.value = 0;
    loadingVar.value(false);
    emitter.emit("asyncComponentLoaded");
  }
}, 1000);

const searchTrigger = (search: string, loading: (load: boolean) => void) => {
  searchVar.value = search;
  loadingVar.value = loading;
  fuseSearch();
};

const hasNextPage = computed(() => {
  const nextOffset = offset.value + limit.value;
  return Boolean(
    selectableOptions.value.slice(nextOffset, limit.value + nextOffset).length
  );
});
const hasPrevPage = computed(() => {
  const prevOffset = offset.value - limit.value;
  return Boolean(
    selectableOptions.value.slice(prevOffset, limit.value + prevOffset).length
  );
});

emitter.emit("asyncComponentLoaded");
loading.value = false;

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
              ".json"
          )
        ).json()
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
          ...scoutingResult.outputs.teams
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

<style scope>
@import "vue-select/dist/vue-select.css";

.pagination {
  display: flex;
  margin: 0.25rem 0.25rem 0;
}
.pagination button {
  flex-grow: 1;
}
.pagination button:hover {
  cursor: pointer;
}
</style>
