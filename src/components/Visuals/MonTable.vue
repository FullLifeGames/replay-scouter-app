<template>
  <div>
    <b-table
      striped
      hover
      :responsive="true"
      :items="speciesRows"
      :fields="fields"
      :is-busy="isBusy"
      :sort-by-formatted="true"
      :sort-null-last="true"
    >
      <template #cell()="data">
        <div v-if="data.item[data.field.key]" class="align-middle">
          {{ data.value }}
          <SpritesRenderer
            :generation="generationNum"
            :name="data.item[data.field.key].name"
          />
        </div>
      </template>
    </b-table>
  </div>
</template>

<script setup lang="ts">
import type { ApiScoutingResult } from "@/api";
import type { GenerationNum, Species } from "@pkmn/dex";

const props = defineProps<{
  scoutingResult: ApiScoutingResult | null;
  species: Species[][];
}>();

const generationNum = ref(9 as GenerationNum);

const isBusy = ref(false);

const fields = computed(() => {
  return [...Array(props.species.length).keys()].map((value, index) => {
    return {
      key: `Team ${index + 1}`,
      label: `Team ${index + 1}`,
      sortable: true,
      formatter: (value: Species) => {
        return value?.name;
      },
      sortByFormatted: true,
    };
  });
});

const speciesRows = computed(() => {
  const filtered = props.species;
  if (filtered) {
    const maxLength = Math.max(...filtered.map((entry) => entry.length));
    const returnList: { [fieldName: string]: Species | null }[] = [];
    for (let i = 0; i < maxLength; i++) {
      const currentObject: { [fieldName: string]: Species | null } = {};
      fields.value.forEach((field, index) => {
        currentObject[field.key] =
          filtered[index] && filtered[index].length > i
            ? filtered[index][i]
            : null;
      });
      returnList.push(currentObject);
    }
    return returnList;
  } else {
    return [];
  }
});
</script>
