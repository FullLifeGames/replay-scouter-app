<template>
  <div class="tt-stack">
    <div class="tt-line" style="gap: 10px 16px">
      <input
        v-model="text"
        class="tt-text"
        style="flex: 1 1 220px; width: auto"
        aria-label="Search Tournaments"
        placeholder="Search these Tournaments"
      />
      <label class="tt-line" style="gap: 6px">
        <input
          type="checkbox"
          :checked="whole"
          @change="all = ($event.target as HTMLInputElement).checked"
        />
        All {{ formatCount(tournamentCount) }} Tournaments, also without Teams
      </label>
    </div>
    <span class="tt-muted tt-small">
      <template v-if="whole">
        {{ formatCount(rows.length) }} Tournaments of the index; only the years
        filter here.
      </template>
      <template v-else>
        {{ formatCount(rows.length) }}
        {{ rows.length === 1 ? "Tournament has" : "Tournaments have" }} Matches
        in the current search.
      </template>
      Newest first. A click adds a Tournament to the filter, or takes it out
      again: several together show how something changed from one to the next.
    </span>
    <div>
      <div class="tt-trow head">
        <span>Tournament</span>
        <span class="n hide-s">Year</span>
        <span class="n hide-s">Rounds</span>
        <span class="n hide-s">{{ whole ? "Matches" : "In search" }}</span>
        <span>Formats</span>
      </div>
      <div
        v-for="row in rows.slice(0, shown)"
        :key="row.tournament.id"
        class="tt-trow"
        :class="{ on: chosen(row.tournament) }"
        role="button"
        tabindex="0"
        :aria-pressed="chosen(row.tournament)"
        @click="toggle(row.tournament)"
        @keydown.enter="toggle(row.tournament)"
      >
        <span style="min-width: 0">
          <span v-if="chosen(row.tournament)" class="tt-tick" aria-hidden="true"
            >✓
          </span>
          <b style="overflow-wrap: anywhere">{{ row.tournament.name }}</b>
        </span>
        <span class="n hide-s tt-muted">{{ row.tournament.year ?? "" }}</span>
        <span class="n hide-s">{{ row.tournament.threads.length }}</span>
        <span class="n hide-s">{{ formatCount(row.matches) }}</span>
        <span :class="{ 'tt-muted': row.formats.length === 0 }">{{
          formatsOf(row)
        }}</span>
      </div>
    </div>
    <div v-if="rows.length === 0" class="tt-note">
      {{ view.loading.value ? "Loading…" : "No Tournament fits." }}
    </div>
    <div v-if="shown < rows.length">
      <button type="button" class="tt-btn" @click="shown += step">
        Show {{ Math.min(step, rows.length - shown) }} more ({{
          formatCount(rows.length - shown)
        }}
        left)
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  formatCount,
  shortFormatName,
  toId,
  type Tournament,
} from "@/tournament/model";
import { useTournamentView } from "@/tournament/useTournamentView";

interface TournamentRow {
  tournament: Tournament;
  /** Matches in the search, or all Matches of the Tournament in the index. */
  matches: number;
  day: number;
  formats: string[];
}

const view = useTournamentView();
const step = 40;

const text = ref("");
const all = ref(false);
const shown = ref(step);

/** The whole index, on request. */
const whole = computed(() => all.value);
const tournamentCount = computed(
  () => view.directory.value?.tournaments.length ?? 0,
);

const rows = computed<TournamentRow[]>(() => {
  const wanted = toId(text.value);
  const fits = (tournament: Tournament) =>
    wanted === "" || toId(tournament.name).includes(wanted);
  const found: TournamentRow[] = [];
  if (whole.value) {
    const filter = view.filter.value;
    for (const tournament of view.directory.value?.tournaments ?? []) {
      if (
        !fits(tournament) ||
        (filter.fromYear !== null &&
          (tournament.year ?? 0) < filter.fromYear) ||
        (filter.toYear !== null && (tournament.year ?? 9999) > filter.toYear)
      ) {
        continue;
      }
      found.push({
        tournament,
        matches: tournament.matches,
        day: tournament.lastDay,
        formats: tournament.formats.map((format) => format.id),
      });
    }
  } else {
    const chosen = view.filter.value.formats;
    const byTournament = new Map<Tournament, TournamentRow>();
    for (const match of view.result.value.matches) {
      const tournament = match.thread?.tournament;
      if (!tournament || !fits(tournament)) {
        continue;
      }
      let row = byTournament.get(tournament);
      if (!row) {
        row = { tournament, matches: 0, day: -1, formats: [] };
        byTournament.set(tournament, row);
      }
      row.matches++;
      row.day = Math.max(row.day, match.day);
      for (const format of match.formats) {
        if (
          (chosen.length === 0 || chosen.includes(format)) &&
          !row.formats.includes(format)
        ) {
          row.formats.push(format);
        }
      }
    }
    found.push(...byTournament.values());
  }
  return found.sort((a, b) => b.day - a.day);
});
watch(rows, () => {
  shown.value = step;
});

const chosen = (tournament: Tournament) =>
  view.state.value.tournaments.includes(tournament.id);
const toggle = (tournament: Tournament) => {
  if (chosen(tournament)) {
    view.removeTournament(tournament.id);
  } else {
    view.pickTournament(tournament.id);
  }
};

const formatsOf = (row: TournamentRow) => {
  if (row.formats.length === 0) {
    return row.tournament.matchesWithGames > 0 ? "not scouted" : "no replays";
  }
  const names = row.formats
    .slice(0, 2)
    .map((format) => shortFormatName(view.directory.value, format));
  const more = row.formats.length - names.length;
  return names.join(", ") + (more > 0 ? ` +${more}` : "");
};
</script>
