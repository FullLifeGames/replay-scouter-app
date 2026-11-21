<template>
  <div class="tt-stack">
    <SortControl />

    <div v-if="opened" class="tt-card tt-stack" style="padding: 10px 12px">
      <div class="tt-line">
        <b>Match of replay {{ opened.id }}</b>
        <button
          type="button"
          class="tt-btn link"
          @click="view.update({ replay: null })"
        >
          Close
        </button>
      </div>
      <span v-if="opened.status === 'loading'" class="tt-muted">Loading…</span>
      <span v-else-if="opened.match === null" class="tt-muted"
        >No Match with this replay is in the Tournament data.</span
      >
      <MatchCard
        v-else
        :key="opened.match.key"
        :match="opened.match"
        show-format
        start-open
      />
    </div>

    <TournamentRounds
      v-if="view.tournament.value"
      :tournament="view.tournament.value"
      :matches="view.sortedMatches.value"
    />
    <MatchList
      v-else
      :matches="view.sortedMatches.value"
      :show-format="state.formats.length !== 1"
      :empty="
        view.loading.value
          ? 'Loading…'
          : 'No Match fits these filters. Remove a filter to see more.'
      "
    />
  </div>
</template>

<script setup lang="ts">
import { useTournamentView } from "@/tournament/useTournamentView";

const view = useTournamentView();
const state = view.state;
const opened = view.opened;
</script>
