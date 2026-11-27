<template>
  <div class="tt-stack">
    <div class="tt-line" style="gap: 10px 16px">
      <SortControl />
      <div
        v-if="view.tournaments.value.length > 0"
        class="tt-seg"
        role="group"
        aria-label="Show the Matches"
      >
        <button
          type="button"
          :class="{ on: !state.byRound }"
          :aria-pressed="!state.byRound"
          @click="view.update({ byRound: false })"
        >
          List
        </button>
        <button
          type="button"
          :class="{ on: state.byRound }"
          :aria-pressed="state.byRound"
          @click="view.update({ byRound: true })"
        >
          By Round
        </button>
      </div>
    </div>

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

    <template v-if="byRound">
      <section
        v-for="tournament in view.tournaments.value"
        :key="tournament.id"
        class="tt-stack"
        style="gap: 6px"
      >
        <h3 v-if="view.tournaments.value.length > 1">{{ tournament.name }}</h3>
        <TournamentRounds
          :tournament="tournament"
          :matches="matchesOf(tournament)"
        />
      </section>
    </template>
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
    <div v-if="(view.paged.value?.older ?? 0) > 0">
      <button
        type="button"
        class="tt-btn"
        :disabled="view.loading.value"
        @click="view.loadOlder()"
      >
        {{ view.loading.value ? "Loading…" : "Load older Tournaments" }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Tournament } from "@/tournament/model";
import { useTournamentView } from "@/tournament/useTournamentView";

const view = useTournamentView();
const state = view.state;
const opened = view.opened;

const byRound = computed(
  () => state.value.byRound && view.tournaments.value.length > 0,
);
const matchesOf = (tournament: Tournament) =>
  view.sortedMatches.value.filter(
    (match) => match.thread?.tournament === tournament,
  );
</script>
