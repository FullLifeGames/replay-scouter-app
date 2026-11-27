<template>
  <div class="tt-field">
    <label class="tt-label" :for="id"
      ><span class="tt-sw" :class="which" aria-hidden="true" />{{
        label
      }}</label
    >
    <template v-for="(group, groupIndex) in groups" :key="groupIndex">
      <div v-if="groupIndex > 0" class="tt-small tt-muted">or a Team with</div>
      <div class="tt-chips">
        <span
          v-for="(condition, index) in group"
          :key="conditionText(condition)"
          class="tt-chip"
          :class="{ neg: condition.exclude, text: !hasIcon(condition) }"
        >
          <IconRenderer v-if="hasIcon(condition)" :name="condition.name" />
          <span v-if="condition.kind !== 'pokemon'" class="kind">{{
            kindLabels[condition.kind]
          }}</span>
          <button
            type="button"
            class="name"
            title="Include or exclude"
            @click="toggle(groupIndex, index)"
          >
            {{ condition.name
            }}<template v-if="condition.on"> on {{ condition.on }}</template>
          </button>
          <button
            type="button"
            :aria-label="`Remove ${condition.name}`"
            @click="remove(groupIndex, index)"
          >
            ×
          </button>
        </span>
      </div>
    </template>
    <div v-if="alternative" class="tt-small tt-muted">or a Team with</div>
    <SuggestInput
      :id="id"
      placeholder="Pokémon, move, item, ability… (- excludes)"
      :options="options"
      @pick="add"
    />
    <div v-if="groups.length > 0" class="tt-small">
      <button
        v-if="!alternative"
        type="button"
        class="tt-btn link"
        title="Also find Teams that have something else instead"
        @click="alternative = true"
      >
        or…
      </button>
      <button
        v-else
        type="button"
        class="tt-btn link"
        @click="alternative = false"
      >
        no alternative
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  conditionText,
  kindLabels,
  pokemonOf,
  withCondition,
  withoutCondition,
  withToggledCondition,
  type Condition,
} from "@/tournament/filter";
import {
  conditionOf,
  conditionSuggestions,
  type Suggestion,
} from "@/tournament/suggestions";
import { useTournamentView } from "@/tournament/useTournamentView";

const properties = defineProps<{
  id: string;
  label: string;
  /** The Team the search is about, or the Team on the other side. */
  which: "has" | "against";
}>();

const view = useTournamentView();
const groups = computed(() => view.state.value[properties.which]);
/** The next pick starts an alternative instead of joining the last group. */
const alternative = ref(false);

const hasIcon = (condition: Condition) =>
  condition.kind === "pokemon" || condition.kind === "lead";

/** The group the next pick joins; one past the last group starts an alternative. */
const target = computed(() =>
  alternative.value
    ? groups.value.length
    : Math.max(groups.value.length - 1, 0),
);

// what the Pokémon of that group carried is offered tied to them: "Stealth Rock on Garchomp"
const options = (text: string) =>
  conditionSuggestions(
    view.vocabulary.value,
    text,
    view.carriersOf(pokemonOf(groups.value[target.value] ?? [])),
  );

const add = (suggestion: Suggestion, exclude: boolean) => {
  const group = target.value;
  alternative.value = false;
  view.update({
    [properties.which]: withCondition(
      groups.value,
      group,
      conditionOf(suggestion, exclude),
    ),
  });
};

const toggle = (group: number, index: number) =>
  view.update({
    [properties.which]: withToggledCondition(groups.value, group, index),
  });

const remove = (group: number, index: number) =>
  view.update({
    [properties.which]: withoutCondition(groups.value, group, index),
  });
</script>
