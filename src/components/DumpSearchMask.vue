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
import { type ApiScoutingResult } from "@/api";
import useEmitter from "@/plugins/emitter";
import type { SearchSelectedOption } from "@/types/searchSelectedOption";
import { SmogonDumpResult } from "@/types/smogonDumpResult";
import { teamStringToPokemon } from "@/util/representationConverter";

const emit = defineEmits<{
  (event: "scouting", scoutingResult: ApiScoutingResult): void;
}>();

const emitter = useEmitter();

const loading = ref(true);

const selectedOptions: Ref<SearchSelectedOption[]> = ref([]);

emitter.emit("asyncComponentLoading");
const options: Ref<SearchSelectedOption[]> = ref([]);

onMounted(async () => {
  const givenOptions: string[] = await (
    await fetch("https://fulllifegames.com/Tools/SmogonDump/list.php")
  ).json();
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
  if (selectedOptions.value && selectedOptions.value.length) {
    loading.value = true;
    emitter.emit("asyncComponentLoading");

    const combinedApiScoutingResult: ApiScoutingResult = {
      outputs: { header: "", teams: [] },
      teams: [],
    };

    for (const selectedOption of selectedOptions.value) {
      let smogonDumpResults: SmogonDumpResult[] = await (
        await fetch(
          "https://fulllifegames.com/Tools/SmogonDump/Teams/" +
            selectedOption.i,
        )
      ).json();

      smogonDumpResults = smogonDumpResults.filter(
        (smogonDumpResult) =>
          teamStringToPokemon(smogonDumpResult.TeamString).length === 6,
      );

      combinedApiScoutingResult.teams = smogonDumpResults.map(
        (smogonDumpResult) => {
          return {
            format: smogonDumpResult.Definition,
            pokemon: teamStringToPokemon(smogonDumpResult.TeamString),
            replays: [
              {
                format: smogonDumpResult.Definition,
                formatId: smogonDumpResult.Definition,
                uploadTime: Date.parse(smogonDumpResult.PostDate) / 1000,
                link: smogonDumpResult.URL,
                id: smogonDumpResult.URL,
                rating: smogonDumpResult.Koeffizient,
                views: smogonDumpResult.Likes,
              },
            ],
          };
        },
      );

      combinedApiScoutingResult.outputs?.teams?.push(
        ...smogonDumpResults.map(
          (el) =>
            `${el.Koeffizient} Score, ${el.Likes} Likes, posted by ${el.PostedBy}:\n${el.URL}` +
            "\n\n" +
            el.TeamString,
        ),
      );
    }

    if (combinedApiScoutingResult.outputs) {
      combinedApiScoutingResult.outputs.header = selectedOptions.value
        .map((el) => el.i)
        .join(", ");
    }

    loading.value = false;
    emitter.emit("asyncComponentLoaded");
    emit("scouting", combinedApiScoutingResult);
  }
};
</script>
