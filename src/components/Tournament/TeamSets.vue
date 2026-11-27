<template>
  <div v-if="team" class="tt-sets" :class="{ mirror }">
    <div v-for="(mon, index) in team.pokemon" :key="index" class="tt-set">
      <IconRenderer
        class="tt-pi"
        :class="highlight?.get(toId(mon.name))"
        :name="mon.name"
      />
      <div>
        <b>{{ mon.name }}</b>
        <template v-if="mon.item">
          @
          <ItemRenderer class="it" :name="alternatives(mon.item)[0]" />
          {{ seen(mon.item) }}
        </template>
        <span v-if="mon.ability" class="tt-muted">
          · {{ seen(mon.ability) }}</span
        >
        <template v-if="mon.tera">
          {{ " " }}<span class="tt-pill">Tera {{ seen(mon.tera) }}</span>
        </template>
        <template v-if="mon.lead">
          {{ " " }}<span class="tt-pill">Lead</span>
        </template>
        <div class="mv">{{ mon.moves.join(", ") || "no moves seen" }}</div>
      </div>
    </div>
  </div>
  <div v-else class="tt-muted tt-small">This side's Team was not scouted.</div>
</template>

<script setup lang="ts">
import { alternatives, toId, type Team } from "@/tournament/model";
import type { Highlight } from "@/tournament/useTournamentView";

withDefaults(
  defineProps<{
    team: Team | null;
    highlight?: Highlight;
    /** Faces the icons to the right, for the left side of a Game: the icons face left, so both Teams face each other. */
    mirror?: boolean;
  }>(),
  { highlight: undefined, mirror: false },
);

/** "Leftovers or Black Sludge" when the scouter saw both in different Games. */
const seen = (value: string) => alternatives(value).join(" or ");
</script>
