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
          <span class="tt-muted">
            <template v-if="view.loading.value && result.matches.length === 0"
              >Loading…</template
            >
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

        <div
          v-if="
            paged &&
            paged.loaded.length > 0 &&
            state.tab !== 'tournaments' &&
            !view.failure.value
          "
          class="tt-note"
          style="margin-bottom: 10px"
        >
          All Formats, from the
          {{ formatCount(paged.loaded.length) }} Tournaments that ended last
          (the oldest on {{ since }}).
          <template v-if="paged.older > 0">
            <button
              type="button"
              class="tt-btn link"
              :disabled="view.loading.value"
              @click="view.loadOlder()"
            >
              {{ view.loading.value ? "Loading…" : "Load older Tournaments" }}
            </button>
            ({{ formatCount(paged.older) }} more)
          </template>
        </div>

        <div v-if="view.failure.value" class="tt-note error" role="alert">
          The Tournament data could not be loaded: {{ view.failure.value }}.
          <button type="button" class="tt-btn link" @click="reload">
            Try again
          </button>
        </div>
        <TournamentsTab v-else-if="state.tab === 'tournaments'" />
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
import { dateOfDay, formatCount } from "@/tournament/model";
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
  const tournaments = view.tournaments.value;
  if (tournaments.length > 0) {
    return tournaments.length <= 3
      ? tournaments.map((tournament) => tournament.name).join(" + ")
      : `${tournaments.length} Tournaments`;
  }
  if (state.value.formats.length > 0) {
    return state.value.formats
      .map((format) => view.formatName(format))
      .join(" + ");
  }
  return state.value.player
    ? view.playerName(state.value.player)
    : "All Formats";
});

const paged = view.paged;
/** How far back the loaded Tournaments are whole: the last day of the one that ended first. */
const since = computed(() => {
  const days = (paged.value?.loaded ?? [])
    .map((tournament) => tournament.lastDay)
    .filter((day) => day >= 0);
  return days.length > 0 ? dateOfDay(Math.min(...days)) : "";
});

/** The first line of the Teams' text export: what was searched. */
const heading = computed(() => {
  const formats = state.value.formats
    .map((format) => view.formatName(format))
    .join(" + ");
  const chosen = view.tournaments.value.length > 0;
  const parts = [
    chosen ? title.value : "",
    state.value.round,
    chosen ? formats : "",
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
