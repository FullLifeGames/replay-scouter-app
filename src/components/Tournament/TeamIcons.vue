<template>
  <span
    class="tt-team"
    :class="{ mirror, nowrap: limit !== undefined }"
    :title="team ? undefined : missing"
  >
    <template v-if="team">
      <IconRenderer
        v-for="(mon, index) in shown"
        :key="index"
        class="tt-pi"
        :class="highlight?.get(toId(mon.name))"
        :name="mon.name"
        :title="mon.name"
        role="img"
        :aria-label="mon.name"
      />
      <span v-if="hidden > 0" class="tt-more">+{{ hidden }}</span>
    </template>
    <template v-else>
      <span
        v-for="index in 6"
        :key="index"
        class="tt-pi-none"
        aria-hidden="true"
        >?</span
      >
    </template>
  </span>
</template>

<script setup lang="ts">
import { toId, type Team } from "@/tournament/model";
import type { Highlight } from "@/tournament/useTournamentView";

const properties = withDefaults(
  defineProps<{
    /** null shows six placeholders. */
    team: Team | null;
    highlight?: Highlight;
    /** Faces the icons to the right, for the left side of a Match: the icons face left, so both Teams face each other. */
    mirror?: boolean;
    /** Shows only this many icons and "+n" for the rest. */
    limit?: number;
    /** The tooltip of the placeholders. */
    missing?: string;
  }>(),
  {
    highlight: undefined,
    mirror: false,
    limit: undefined,
    missing: "This Team was not scouted",
  },
);

const shown = computed(() =>
  properties.limit === undefined
    ? (properties.team?.pokemon ?? [])
    : (properties.team?.pokemon.slice(0, properties.limit) ?? []),
);
const hidden = computed(
  () => (properties.team?.pokemon.length ?? 0) - shown.value.length,
);
</script>
