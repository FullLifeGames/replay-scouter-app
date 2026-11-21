<template>
  <div class="tt-stack" style="gap: 4px">
    <div class="tt-card tt-stack" style="padding: 12px 14px; gap: 8px">
      <div class="tt-line" style="gap: 6px 12px">
        <span class="tt-pill" :class="categoryClass(tournament.category)">{{
          tournament.category
        }}</span>
        <span class="tt-muted">
          <template v-if="tournament.firstDay >= 0">
            {{ dateOfDay(tournament.firstDay) }} –
            {{ dateOfDay(tournament.lastDay) }} ·
          </template>
          {{ tournament.threads.length }}
          {{ tournament.threads.length === 1 ? "thread" : "threads" }} ·
          {{ formatCount(tournament.matches) }} Matches,
          {{ formatCount(tournament.matchesWithGames) }} with replays
        </span>
      </div>
      <div v-if="tournament.formats.length > 0" class="tt-chips">
        <span class="tt-muted tt-small">Formats played</span>
        <button
          v-for="format in tournament.formats"
          :key="format.id"
          type="button"
          class="tt-chip text"
          :class="{ on: state.formats.includes(format.id) }"
          :aria-pressed="state.formats.includes(format.id)"
          title="Show only this Format (click again for all)"
          @click="toggleFormat(format.id)"
        >
          {{ view.formatName(format.id) }}
          <span class="tt-muted">{{ format.games }}</span>
        </button>
      </div>
      <span v-else class="tt-muted tt-small"
        >No replay of this Tournament could be scouted. Its threads and Match
        counts are below.</span
      >
      <div class="tt-line">
        <button
          v-if="widenTo.length > 0"
          type="button"
          class="tt-btn"
          @click="view.clearTournament()"
        >
          Widen to all of {{ widenLabel }} →
        </button>
        <details v-if="records.length > 0" class="tt-small">
          <summary style="cursor: pointer">Players by record</summary>
          <div class="tt-kv" style="margin-top: 6px; max-width: 280px">
            <div v-for="record in records" :key="record.key">
              <button
                type="button"
                class="tt-rowname"
                @click="view.update({ player: record.key })"
              >
                {{ record.name }}
              </button>
              <span class="tt-muted">{{ record.won }}–{{ record.lost }}</span>
            </div>
          </div>
        </details>
      </div>
    </div>

    <section v-for="thread in threads" :key="thread.id" class="tt-round">
      <header>
        <h3>{{ thread.round || "Whole Tournament" }}</h3>
        <span class="tt-muted tt-small">
          {{ dateOfDay(thread.day) }} · {{ thread.matches }}
          {{ thread.matches === 1 ? "Match" : "Matches" }} ·
          {{ thread.matchesWithGames }} with replays
          <template v-if="byThread.get(thread.id)">
            · {{ byThread.get(thread.id)!.length }} shown</template
          >
        </span>
        <a
          class="tt-small"
          :href="threadUrl(thread.id)"
          target="_blank"
          rel="noopener"
          >Thread ↗</a
        >
        <template v-if="thread.round !== '' && hasRounds">
          <button
            v-if="state.round === null"
            type="button"
            class="tt-btn link tt-small"
            @click="view.update({ round: thread.round })"
          >
            Only this Round
          </button>
          <button
            v-else
            type="button"
            class="tt-btn link tt-small"
            @click="view.update({ round: null })"
          >
            All Rounds
          </button>
        </template>
      </header>
      <MatchList
        v-if="byThread.get(thread.id)"
        :matches="byThread.get(thread.id)!"
        :show-tournament="false"
        :show-format="state.formats.length !== 1"
        :step="10"
      />
      <span v-else class="tt-small tt-muted">{{ emptyNote(thread) }}</span>
    </section>
  </div>
</template>

<script setup lang="ts">
import {
  dateOfDay,
  formatCount,
  threadUrl,
  type Match,
  type Thread,
  type Tournament,
} from "@/tournament/model";
import { useTournamentView } from "@/tournament/useTournamentView";
import { categoryClass } from "@/tournament/categories";

const properties = defineProps<{
  tournament: Tournament;
  /** The Matches of the search, in the order to show them. */
  matches: Match[];
}>();

const view = useTournamentView();
const state = view.state;

const byThread = computed(() => {
  const groups = new Map<number, Match[]>();
  for (const match of properties.matches) {
    const group = groups.get(match.threadId);
    if (group) {
      group.push(match);
    } else {
      groups.set(match.threadId, [match]);
    }
  }
  return groups;
});

const hasRounds = computed(() => properties.tournament.threads.length > 1);

/** The threads of the chosen Round, newest first unless the order asks for the oldest first. */
const threads = computed(() => {
  const chosen = properties.tournament.threads.filter(
    (thread) =>
      state.value.round === null || thread.round === state.value.round,
  );
  return state.value.sort === "date" && state.value.reversed
    ? chosen
    : chosen.toReversed();
});

const toggleFormat = (format: string) =>
  view.update({
    formats: state.value.formats.includes(format)
      ? state.value.formats.filter((entry) => entry !== format)
      : [...state.value.formats, format],
  });

const widenTo = computed(() =>
  state.value.formats.length > 0
    ? state.value.formats
    : properties.tournament.formats.map((format) => format.id),
);
const widenLabel = computed(() =>
  widenTo.value.length <= 2
    ? widenTo.value.map((format) => view.formatName(format)).join(" + ")
    : `its ${widenTo.value.length} Formats`,
);

/** Won and lost Matches per Player among the Matches shown, best first. */
const records = computed(() => {
  const table = new Map<
    string,
    { key: string; name: string; won: number; lost: number }
  >();
  for (const match of properties.matches) {
    if (!match.decided) {
      continue;
    }
    for (const [side, won] of [
      [match.left, true],
      [match.right, false],
    ] as const) {
      if (side.player === null) {
        continue;
      }
      let record = table.get(side.player.key);
      if (!record) {
        record = { ...side.player, won: 0, lost: 0 };
        table.set(side.player.key, record);
      }
      if (won) {
        record.won++;
      } else {
        record.lost++;
      }
    }
  }
  return [...table.values()]
    .sort((a, b) => b.won - a.won || a.lost - b.lost)
    .slice(0, 16);
});

const emptyNote = (thread: Thread) => {
  if (thread.matchesWithGames === 0) {
    return "No Match of this thread has a replay that still exists.";
  }
  return view.loading.value
    ? "Loading…"
    : "No Match of this thread fits the filters.";
};
</script>
