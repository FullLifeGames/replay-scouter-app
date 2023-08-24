<template>
  <div>
    <b-form-group
      class="mb-3"
      label-class="fw-bold pt-0"
      label="Smogon Team Dump"
      label-for="dump-input"
      description="Search for a Smogon Team Dump"
    >
      <SearchSelect
        v-model="selectedOptions"
        :options="options"
        placeholder="Search for a Smogon Team Dump (e.g. gen7ou)"
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
        Visualize Smogon Team Dumps
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ApiScoutingResult } from "@/api";
import useEmitter from "@/plugins/emitter";
import type { SearchSelectedOption } from "@/types/searchSelectedOption";
import { retrieveSmogonDumpEntry } from "@/util/dumpHelper";

const emit = defineEmits<{
  (event: "scouting", scoutingResult: ApiScoutingResult): void;
}>();

const emitter = useEmitter();

const loading = ref(true);

const selectedOptions = ref<SearchSelectedOption[]>([]);

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

const scout = async () => {
  if (selectedOptions.value && selectedOptions.value.length > 0) {
    loading.value = true;
    emitter.emit("asyncComponentLoading");

    const combinedApiScoutingResult: ApiScoutingResult = {
      outputs: { header: "", teams: [] },
      teams: [],
    };

    for (const selectedOption of selectedOptions.value) {
      const [teams, outputTeams] = await retrieveSmogonDumpEntry(
        selectedOption.i,
      );

      combinedApiScoutingResult.teams = teams;
      combinedApiScoutingResult.outputs?.teams?.push(...outputTeams);
    }

    if (combinedApiScoutingResult.outputs) {
      combinedApiScoutingResult.outputs.header = selectedOptions.value
        .map((element) => element.i)
        .join(", ");
    }

    loading.value = false;
    emitter.emit("asyncComponentLoaded");
    emit("scouting", combinedApiScoutingResult);
  }
};
</script>
