<template>
  <b-form-group
    label-class="fw-bold pt-0"
    label="Sort Options"
    label-for="sort-input"
    description="Select your sorting options for the content down below"
  >
    <!-- Prop `add-on-change` is needed to enable adding tags via the `change` event -->
    <b-form-tags
      id="sort-input"
      v-model="values"
      size="lg"
      add-on-change
      no-outer-focus
      @change="change"
    >
      <template
        #default="{ tags, inputAttrs, inputHandlers, disabled, removeTag }"
      >
        <ul v-if="tags.length > 0" class="list-inline d-inline-block mb-2">
          <li v-for="tag in tags" :key="tag" class="list-inline-item">
            <b-form-tag
              :title="tag"
              :disabled="disabled"
              @remove="removeTag(tag)"
              >{{ tag }}</b-form-tag
            >
          </li>
        </ul>
        <b-form-select
          v-bind="inputAttrs"
          :disabled="disabled || availableOptions.length === 0"
          :options="availableOptions"
          v-on="inputHandlers"
        >
          <template #first>
            <!-- This is required to prevent bugs with Safari -->
            <option disabled value="">Choose a tag...</option>
          </template>
        </b-form-select>
      </template>
    </b-form-tags>
  </b-form-group>
</template>

<script setup lang="ts">
import type { SortOptions } from "@/types/sortOptions";

const emit = defineEmits<{
  (event: "change", values: SortOptions[]): void;
}>();

// From: https://bootstrap-vue.github.io/bootstrap-vue-next/components/FormTags.html#using-custom-form-components
const options = ref<SortOptions[]>([
  "Date (Asc)",
  "Date (Desc)",
  "Format (Asc)",
  "Format (Desc)",
  "Number of Replays (Asc)",
  "Number of Replays (Desc)",
  "Player (Asc)",
  "Player (Desc)",
  "Rating (Asc)",
  "Rating (Desc)",
  "Views (Asc)",
  "Views (Desc)",
]);
const values = ref<SortOptions[]>([]);

const availableOptions = computed(() =>
  options.value.filter((opt) => values.value.indexOf(opt) === -1)
);

const change = () => {
  emit("change", values.value);
};
</script>

<style scoped></style>
