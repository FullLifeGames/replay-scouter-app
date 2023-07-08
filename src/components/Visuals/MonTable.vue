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
          {{ data.item[data.field.key].name }}
          <ItemRenderer
            class="renderedItem"
            :name="data.item[data.field.key].item"
          />
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
import type { ApiScoutingResult, Pokemon, Team } from "@/api";
import type { GenerationNum } from "@pkmn/dex";

const props = defineProps<{
  scoutingResult: ApiScoutingResult | null;
  teams: Team[];
}>();

const generationNum = ref(9 as GenerationNum);

const isBusy = ref(false);

const fields = computed(() => {
  return [...Array(props.teams.length).keys()].map((value, index) => {
    return {
      key: `Team ${index + 1}`,
      label: `Team ${index + 1}`,
      sortable: true,
      formatter: (value: Pokemon) => {
        return value?.name;
      },
      sortByFormatted: true,
    };
  });
});

const speciesRows = computed(() => {
  const filtered = props.teams;
  if (filtered) {
    const maxLength = Math.max(
      ...filtered.map((entry) => entry.pokemon?.length ?? 0),
    );
    const returnList: { [fieldName: string]: Pokemon | null }[] = [];
    for (let i = 0; i < maxLength; i++) {
      const currentObject: { [fieldName: string]: Pokemon | null } = {};
      fields.value.forEach((field, index) => {
        currentObject[field.key] =
          filtered[index] &&
          (filtered[index].pokemon?.length ?? 0) > i &&
          filtered[index].pokemon
            ? // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              filtered[index].pokemon![i]
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

<style scoped>
.renderedItem {
  margin-left: -4px;
  margin-bottom: -6px;
}
</style>
