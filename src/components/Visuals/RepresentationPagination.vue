<template>
  <div>
    <b-row v-if="numberOfEntries > 0">
      <b-col :cols="10">
        <b-pagination
          v-model="currentPage"
          :per-page="perPage"
          :total-rows="numberOfEntries"
          size="md"
          class="flex-grow-1 justify-content-end"
        ></b-pagination>
      </b-col>
      <b-col :cols="2">
        <b-form-select
          v-model="perPage"
          :options="entryOptions"
          class="mt-1"
        ></b-form-select
      ></b-col>
    </b-row>
    <p v-else style="font-style: italic">No Team found ...</p>
  </div>
</template>

<script setup lang="ts">
import type { Team } from "@/api";

const props = defineProps<{
  teams: Team[];
  outputTeams: string[];
}>();

const emits = defineEmits<{
  (event: "change", teams: Team[], outputs: string[]): void;
}>();

const currentPage = ref(1);

const perPage = ref(10);

const teams = computed(() => {
  return props.teams;
});
const outputTeams = computed(() => {
  return props.outputTeams;
});

const numberOfEntries = computed(() => {
  return teams.value.length;
});

const entryOptions = ref([
  { value: 10, text: "10" },
  { value: 50, text: "50" },
  { value: 100, text: "100" },
  { value: Number.MAX_VALUE, text: "All" },
]);

const determineTeams = () => {
  emits(
    "change",
    teams.value.slice(
      (currentPage.value - 1) * perPage.value,
      +(currentPage.value - 1) * perPage.value + perPage.value,
    ),
    outputTeams.value.slice(
      (currentPage.value - 1) * perPage.value,
      +(currentPage.value - 1) * perPage.value + perPage.value,
    ),
  );
};

watch(numberOfEntries, () => {
  currentPage.value = 1;
  determineTeams();
});
watch(teams, () => {
  currentPage.value = 1;
  determineTeams();
});
watch(outputTeams, () => {
  currentPage.value = 1;
  determineTeams();
});

watch(perPage, () => {
  currentPage.value = 1;
  determineTeams();
});

watch(currentPage, () => {
  determineTeams();
});

determineTeams();
</script>
