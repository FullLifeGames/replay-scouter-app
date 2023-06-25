<template>
  <v-select
    id="select-input"
    v-model="selectedOptions"
    :filterable="false"
    multiple
    :options="paginated"
    :placeholder="placeholder"
    label="n"
    @search="searchTrigger"
  >
    <template #list-footer>
      <li class="pagination">
        <button :disabled="!hasPrevPage" @click="offset -= limit">Prev</button>
        <button :disabled="!hasNextPage" @click="offset += limit">Next</button>
      </li>
    </template></v-select
  >
</template>

<script setup lang="ts">
import useEmitter from "@/plugins/emitter";
import type { SearchSelectedOption } from "@/types/searchSelectedOption";
import { useDebounceFn } from "@vueuse/core";
import Fuse from "fuse.js";

const props = defineProps<{
  options: SearchSelectedOption[];
  placeholder: string;
}>();

const emitter = useEmitter();

const offset = ref(0);
const limit = ref(10);

const selectedOptions = defineModel<SearchSelectedOption[]>();

const selectableOptions: Ref<SearchSelectedOption[]> = ref([]);

const paginated = computed(() => {
  return selectableOptions.value.slice(
    offset.value,
    limit.value + offset.value
  );
});

watch(props.options, () => (selectableOptions.value = props.options));

const searchVar = ref("");
const loadingVar = ref(null as ((load: boolean) => void) | null);

const fuseSearch = useDebounceFn(() => {
  if (loadingVar.value !== null) {
    loadingVar.value(true);
    emitter.emit("asyncComponentLoading");
    const fuse = new Fuse(props.options, {
      keys: ["i", "n"],
      shouldSort: true,
    });
    selectableOptions.value = searchVar.value.length
      ? fuse.search(searchVar.value).map(({ item }) => item)
      : props.options;
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
</script>
