<template>
  <v-select
    v-model="selectedOptions"
    :filterable="false"
    :multiple="!single"
    :options="paginated"
    :placeholder="placeholder"
    :taggable="taggable"
    label="n"
    @search="searchTrigger"
  >
    <template #list-footer>
      <li class="pagination">
        <button :disabled="!hasPreviousPage" @click="offset -= limit">
          Prev
        </button>
        <button :disabled="!hasNextPage" @click="offset += limit">Next</button>
      </li>
    </template></v-select
  >
</template>

<script setup lang="ts">
import useEmitter from "@/plugins/emitter";
import type { SearchSelectedOption } from "@/types/searchSelectedOption";
import { filterSearchValue } from "@/util/linkHelper";
import { useDebounceFn } from "@vueuse/core";
import Fuse from "fuse.js";

const properties = defineProps<{
  single?: boolean;
  options: SearchSelectedOption[];
  placeholder: string;
  taggable: boolean;
}>();

const emitter = useEmitter();

const offset = ref(0);
const limit = ref(10);

const selectedOptions = defineModel<
  SearchSelectedOption[] | SearchSelectedOption | null
>();

const selectableOptions = ref<SearchSelectedOption[]>([...properties.options]);

const paginated = computed(() => {
  return selectableOptions.value.slice(
    offset.value,
    limit.value + offset.value,
  );
});

watch(properties.options, () => (selectableOptions.value = properties.options));

const searchVariable = ref("");
const loadingVariable = ref(null as ((load: boolean) => void) | null);

const fuseSearch = useDebounceFn(() => {
  if (loadingVariable.value !== null) {
    loadingVariable.value(true);
    emitter.emit("asyncComponentLoading");
    const fuse = new Fuse(properties.options, {
      keys: ["i", "n"],
      shouldSort: true,
    });
    selectableOptions.value =
      searchVariable.value.length > 0
        ? fuse.search(searchVariable.value).map(({ item }) => item)
        : properties.options;
    offset.value = 0;
    loadingVariable.value(false);
    emitter.emit("asyncComponentLoaded");
  }
}, 500);

const searchTrigger = (search: string, loading: (load: boolean) => void) => {
  searchVariable.value = filterSearchValue(search);
  loadingVariable.value = loading;
  fuseSearch();
};

const hasNextPage = computed(() => {
  const nextOffset = offset.value + limit.value;
  return (
    selectableOptions.value.slice(nextOffset, limit.value + nextOffset).length >
    0
  );
});
const hasPreviousPage = computed(() => {
  const previousOffset = offset.value - limit.value;
  return (
    selectableOptions.value.slice(previousOffset, limit.value + previousOffset)
      .length > 0
  );
});
</script>

<style scope>
@import "vue-select/dist/vue-select.css";

.vs__dropdown-toggle {
  border: var(--bs-border-width) solid var(--bs-border-color);
}
.vs__search::placeholder {
  color: rgb(117, 117, 117);
}
.vs__search {
  padding: 0.13rem 0.6rem;
}
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
