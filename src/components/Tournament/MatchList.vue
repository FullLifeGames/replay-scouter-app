<template>
  <div v-if="matches.length === 0" class="tt-note">{{ empty }}</div>
  <div v-else class="tt-mlist">
    <MatchCard
      v-for="match in matches.slice(0, shown)"
      :key="match.key"
      :match="match"
      :show-tournament="showTournament"
      :show-format="showFormat"
    />
    <button
      v-if="shown < matches.length"
      type="button"
      class="tt-btn"
      @click="shown += step"
    >
      Show {{ Math.min(step, matches.length - shown) }} more ({{
        formatCount(matches.length - shown)
      }}
      left)
    </button>
  </div>
</template>

<script setup lang="ts">
import { formatCount, type Match } from "@/tournament/model";

const properties = withDefaults(
  defineProps<{
    matches: Match[];
    showTournament?: boolean;
    showFormat?: boolean;
    step?: number;
    empty?: string;
  }>(),
  {
    showTournament: true,
    showFormat: false,
    step: 25,
    empty: "No Match fits these filters. Remove a filter to see more.",
  },
);

const shown = ref(properties.step);
watch(
  () => properties.matches,
  () => {
    shown.value = properties.step;
  },
);
</script>
