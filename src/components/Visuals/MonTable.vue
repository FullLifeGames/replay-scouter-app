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
            :generation="generationNumber"
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

const properties = defineProps<{
  scoutingResult: ApiScoutingResult | null;
  teams: Team[];
}>();

const generationNumber = ref(9 as GenerationNum);

const isBusy = ref(false);

const fields = computed(() => {
  return [...Array.from({ length: properties.teams.length }).keys()].map(
    (value, index) => {
      return {
        key: `Team ${index + 1}`,
        label: `Team ${index + 1}`,
        sortable: true,
        formatter: (value: Pokemon) => {
          return value?.name;
        },
        sortByFormatted: true,
      };
    },
  );
});

type ReturnListEntry = { [fieldName: string]: Pokemon | null };
const speciesRows = computed(() => {
  const filtered = properties.teams;
  if (filtered) {
    const maxLength = Math.max(
      ...filtered.map((entry) => entry.pokemon?.length ?? 0),
    );
    const returnList: ReturnListEntry[] = [];
    for (let index_ = 0; index_ < maxLength; index_++) {
      const currentObject: ReturnListEntry = {};
      for (const index in fields.value) {
        const field = fields.value[index];
        const filteredField = filtered[index];
        const pokemon = filteredField.pokemon;
        currentObject[field.key] =
          pokemon && pokemon.length > index_ ? pokemon[index_] : null;
      }
      for (const [index, field] of fields.value.entries()) {
        currentObject[field.key] =
          filtered[index] &&
          (filtered[index].pokemon?.length ?? 0) > index_ &&
          filtered[index].pokemon
            ? filtered[index].pokemon![index_]
            : null;
      }
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
