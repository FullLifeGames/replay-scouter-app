<template>
  <div class="tt">
    <div style="margin-bottom: 16px">
      <TournamentSearchBox />
    </div>
    <div class="tt-layout">
      <aside>
        <TournamentFilters />
      </aside>
      <section style="min-width: 0">
        <div class="tt-rhead">
          <h2>{{ title }}</h2>
          <span v-if="!view.needsNarrowing.value" class="tt-muted">
            <template v-if="view.loading.value">Loading…</template>
            <template v-else>
              {{ formatCount(result.matches.length) }}
              {{ result.matches.length === 1 ? "Match" : "Matches" }} ·
              {{ formatCount(result.games.length) }}
              {{ result.games.length === 1 ? "Game" : "Games" }}
            </template>
          </span>
          <span class="tt-muted tt-small" style="margin-left: auto">
            <template v-if="generated">Data of {{ generated }} · </template>
            <RouterLink to="/tournaments">Classic view</RouterLink>
          </span>
        </div>
        <div class="tt-tabs" role="tablist">
          <button
            v-for="[tab, label] in tabs"
            :key="tab"
            type="button"
            role="tab"
            :aria-selected="state.tab === tab"
            :class="{ on: state.tab === tab }"
            @click="view.update({ tab })"
          >
            {{ label }}
          </button>
        </div>

        <div v-if="view.failure.value" class="tt-note error" role="alert">
          The Tournament data could not be loaded: {{ view.failure.value }}.
          <button type="button" class="tt-btn link" @click="reload">
            Try again
          </button>
        </div>
        <TournamentsTab v-else-if="state.tab === 'tournaments'" />
        <div v-else-if="view.needsNarrowing.value" class="tt-note">
          Choose a Format, a Tournament or a Player. All Formats together are
          too large to load at once. The Tournaments tab works without one.
        </div>
        <div
          v-else-if="view.loading.value && result.matches.length === 0"
          class="tt-note"
        >
          Loading…
        </div>
        <MatchesTab v-else-if="state.tab === 'matches'" />
        <TeamsTab
          v-else-if="state.tab === 'teams'"
          :sides="result.sides"
          :as="state.teamsAs"
          :sort="state.sort"
          :reversed="state.reversed"
          :heading="heading"
          :format-name="view.formatName"
          :highlight="view.highlight.value"
          @update:as="(teamsAs) => view.update({ teamsAs })"
        >
          <template #controls><SortControl /></template>
        </TeamsTab>
        <StatsTab
          v-else
          :sides="result.sides"
          :format="state.statsFormat"
          :table="state.statsTable"
          :format-name="view.formatName"
          @update:format="(statsFormat) => view.update({ statsFormat })"
          @update:table="(statsTable) => view.update({ statsTable })"
          @require="showMatches"
        />
      </section>
    </div>
    <div v-if="view.toast.value" class="tt-toast" role="status">
      <span>{{ view.toast.value.text }}</span>
      <button type="button" @click="view.undo()">Undo</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import "@/assets/tournament-teams.css";
import {
  withConditionsInAll,
  type Condition,
  type Tab,
} from "@/tournament/filter";
import { formatCount } from "@/tournament/model";
import { provideTournamentView } from "@/tournament/useTournamentView";

const view = provideTournamentView();
const state = view.state;
const result = view.result;

const tabs: [Tab, string][] = [
  ["matches", "Matches"],
  ["teams", "Teams"],
  ["stats", "Stats"],
  ["tournaments", "Tournaments"],
];

const title = computed(() => {
  if (view.tournament.value) {
    return view.tournament.value.name;
  }
  if (state.value.formats.length > 0) {
    return state.value.formats
      .map((format) => view.formatName(format))
      .join(" + ");
  }
  return state.value.player
    ? view.playerName(state.value.player)
    : "Tournament Teams";
});

/** The first line of the Teams' text export: what was searched. */
const heading = computed(() => {
  const formats = state.value.formats
    .map((format) => view.formatName(format))
    .join(" + ");
  const parts = [
    view.tournament.value?.name,
    state.value.round,
    view.tournament.value ? formats : "",
    state.value.player ? view.playerName(state.value.player) : "",
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : title.value;
});

const generated = computed(() => {
  const written = view.directory.value?.generated;
  return written
    ? new Date(written).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "";
});

/** A click on a statistics row: the Matches of the Teams that row counts. */
const showMatches = (conditions: Condition[], about: string) =>
  view.update(
    {
      tab: "matches",
      has: withConditionsInAll(state.value.has, conditions),
    },
    `Showing Matches with ${about}`,
  );

const reload = () => globalThis.location.reload();
</script>
