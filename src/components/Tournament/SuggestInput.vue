<template>
  <div class="tt-suggest">
    <input
      :id="id"
      v-model="text"
      class="tt-text"
      :class="{ big }"
      :placeholder="placeholder"
      autocomplete="off"
      role="combobox"
      :aria-expanded="items.length > 0"
      :aria-controls="`${id}-list`"
      @input="onInput"
      @focus="open = true"
      @blur="close"
      @keydown="onKey"
    />
    <div
      v-if="items.length > 0"
      :id="`${id}-list`"
      class="tt-sugg"
      role="listbox"
    >
      <template
        v-for="(item, index) in items"
        :key="`${item.kind}:${item.value}:${item.on ?? ''}:${item.against ?? ''}`"
      >
        <div
          v-if="item.group && item.group !== items[index - 1]?.group"
          class="grp tt-label"
        >
          {{ item.group }}
        </div>
        <button
          type="button"
          role="option"
          :class="{ act: index === active }"
          :aria-selected="index === active"
          @mousedown.prevent="pick(item)"
        >
          <IconRenderer v-if="item.icon" :name="item.icon" />
          <span>
            {{ item.label }}
            <span v-if="item.detail" class="tt-muted tt-small">{{
              item.detail
            }}</span>
          </span>
          <span v-if="item.count !== undefined" class="cnt">{{
            formatCount(item.count)
          }}</span>
        </button>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatCount } from "@/tournament/model";
import type { Suggestion } from "@/tournament/suggestions";

const properties = withDefaults(
  defineProps<{
    id: string;
    placeholder?: string;
    /**
     * What to offer for the typed text; a leading "-" is taken off and reported with the pick. With
     * `freeText`, the whole text, and the suggestion says whether it excludes.
     */
    options: (text: string) => Suggestion[];
    big?: boolean;
    limit?: number;
    /**
     * The text is a search of its own (`v-model`): it stays after a pick, as the pick's `rest`, and
     * Enter keeps it unless a suggestion was chosen with the arrow keys.
     */
    freeText?: boolean;
    modelValue?: string;
  }>(),
  {
    placeholder: "",
    big: false,
    limit: 40,
    freeText: false,
    modelValue: "",
  },
);

const emit = defineEmits<{
  pick: [suggestion: Suggestion, exclude: boolean];
  "update:modelValue": [text: string];
  /** Enter without a chosen suggestion, in `freeText` mode. */
  submit: [text: string];
}>();

const text = ref(properties.freeText ? properties.modelValue : "");
const open = ref(false);
// with free text nothing is chosen until the arrow keys choose it: Enter keeps the text
const none = properties.freeText ? -1 : 0;
const active = ref(none);

// the text changed elsewhere (a pick, Clear filters, the browser's Back); spaces being typed stay
watch(
  () => properties.modelValue,
  (value) => {
    if (properties.freeText && value !== text.value.trim()) {
      text.value = value;
    }
  },
);

const exclude = computed(() => text.value.trim().startsWith("-"));
const items = computed(() => {
  if (!open.value) {
    return [];
  }
  const typed = properties.freeText
    ? text.value
    : text.value.trim().replace(/^-\s*/, "");
  return properties.options(typed).slice(0, properties.limit);
});

const pick = (item: Suggestion | undefined) => {
  if (!item) {
    return;
  }
  if (properties.freeText) {
    emit("pick", item, item.exclude ?? false);
    text.value = item.rest ?? "";
  } else {
    emit("pick", item, exclude.value);
    text.value = "";
  }
  active.value = none;
};

const onInput = () => {
  open.value = true;
  active.value = none;
  if (properties.freeText) {
    emit("update:modelValue", text.value);
  }
};

const close = () => {
  // after the click on a suggestion has been handled
  setTimeout(() => {
    open.value = false;
  }, 150);
};

const onKey = (event: KeyboardEvent) => {
  switch (event.key) {
    case "ArrowDown": {
      open.value = true;
      active.value = Math.min(active.value + 1, items.value.length - 1);
      event.preventDefault();
      break;
    }
    case "ArrowUp": {
      active.value = Math.max(active.value - 1, none);
      event.preventDefault();
      break;
    }
    case "Enter": {
      if (properties.freeText && active.value === -1) {
        open.value = false;
        emit("submit", text.value);
      } else {
        pick(items.value[active.value]);
      }
      event.preventDefault();
      break;
    }
    case "Escape": {
      open.value = false;
      break;
    }
    default: {
      break;
    }
  }
};
</script>
