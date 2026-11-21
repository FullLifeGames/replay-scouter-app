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
        :key="`${item.kind}:${item.value}`"
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
    /** What to offer for the typed text; a leading "-" is taken off and reported with the pick. */
    options: (text: string) => Suggestion[];
    big?: boolean;
    limit?: number;
  }>(),
  { placeholder: "", big: false, limit: 40 },
);

const emit = defineEmits<{
  pick: [suggestion: Suggestion, exclude: boolean];
}>();

const text = ref("");
const open = ref(false);
const active = ref(0);

const exclude = computed(() => text.value.trim().startsWith("-"));
const items = computed(() =>
  open.value
    ? properties
        .options(text.value.trim().replace(/^-\s*/, ""))
        .slice(0, properties.limit)
    : [],
);

const pick = (item: Suggestion | undefined) => {
  if (!item) {
    return;
  }
  emit("pick", item, exclude.value);
  text.value = "";
  active.value = 0;
};

const onInput = () => {
  open.value = true;
  active.value = 0;
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
      active.value = Math.max(active.value - 1, 0);
      event.preventDefault();
      break;
    }
    case "Enter": {
      pick(items.value[active.value]);
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
