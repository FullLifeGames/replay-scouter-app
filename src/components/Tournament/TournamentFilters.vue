<template>
  <details
    class="tt-filters"
    :open="wide || expanded"
    @toggle="expanded = ($event.target as HTMLDetailsElement).open"
  >
    <summary>Filters ({{ countFilters(state) }} set)</summary>
    <div class="tt-stack" style="gap: 14px">
      <div class="tt-field">
        <label class="tt-label" for="tt-format">Formats</label>
        <div v-if="state.formats.length > 0" class="tt-chips">
          <span
            v-for="format in state.formats"
            :key="format"
            class="tt-chip text on"
          >
            <b>{{ view.formatName(format) }}</b>
            <button
              type="button"
              :aria-label="`Remove ${view.formatName(format)}`"
              @click="removeFormat(format)"
            >
              ×
            </button>
          </span>
        </div>
        <span v-else class="tt-small"
          ><b>{{ noFormats }}</b></span
        >
        <SuggestInput
          id="tt-format"
          placeholder="Add a Format"
          :options="formatOptions"
          @pick="addFormat"
        />
      </div>

      <ConditionPicker id="tt-has" label="Team has" which="has" />

      <div class="tt-field">
        <span class="tt-label">That Team</span>
        <div class="tt-seg">
          <button
            v-for="[value, label] in outcomes"
            :key="value"
            type="button"
            :class="{ on: state.outcome === value }"
            @click="view.update({ outcome: value })"
          >
            {{ label }}
          </button>
        </div>
      </div>

      <ConditionPicker
        id="tt-against"
        label="Against a Team with"
        which="against"
      />

      <div class="tt-field">
        <label class="tt-label" for="tt-player">Player</label>
        <div v-if="state.player" class="tt-chips">
          <span class="tt-chip text">
            <b>{{ view.playerName(state.player) }}</b>
            <span v-if="otherAlts > 0" class="tt-muted"
              >· {{ otherAlts }} {{ otherAlts === 1 ? "Alt" : "Alts" }}</span
            >
            <button
              type="button"
              aria-label="Remove the Player"
              @click="view.update({ player: null })"
            >
              ×
            </button>
          </span>
        </div>
        <SuggestInput
          v-else
          id="tt-player"
          placeholder="Smogon user or Showdown name"
          :options="playerOptions"
          @pick="(pick) => view.update({ player: pick.value })"
        />
      </div>

      <div class="tt-field">
        <label class="tt-label" for="tt-tournament">Tournament</label>
        <template v-if="state.tournament">
          <div class="tt-chips">
            <span class="tt-chip text">
              <b>{{ view.tournament.value?.name ?? state.tournament }}</b>
              <button
                type="button"
                aria-label="Remove the Tournament"
                @click="view.clearTournament()"
              >
                ×
              </button>
            </span>
          </div>
          <select
            v-if="rounds.length > 1"
            class="wide"
            aria-label="Round"
            :value="state.round ?? ''"
            @change="
              view.update({
                round: ($event.target as HTMLSelectElement).value || null,
              })
            "
          >
            <option value="">All Rounds</option>
            <option v-for="round in rounds" :key="round" :value="round">
              {{ round }}
            </option>
          </select>
        </template>
        <SuggestInput
          v-else
          id="tt-tournament"
          placeholder="e.g. SPL XVI, ADPL IX"
          :options="tournamentOptions"
          @pick="(pick) => view.pickTournament(pick.value)"
        />
      </div>

      <div class="tt-field">
        <span class="tt-label">Category</span>
        <div class="tt-chips">
          <button
            v-for="category in categories"
            :key="category"
            type="button"
            class="tt-chip text"
            :class="{ on: state.categories.includes(category) }"
            :aria-pressed="state.categories.includes(category)"
            @click="toggleCategory(category)"
          >
            {{ category }}
          </button>
        </div>
        <span class="tt-muted tt-small"
          >From the forum of the Tournament. None chosen means all.</span
        >
      </div>

      <div class="tt-field">
        <span class="tt-label">Years</span>
        <div class="tt-line">
          <select
            aria-label="From year"
            :value="state.fromYear ?? ''"
            @change="setYear('fromYear', $event)"
          >
            <option value="">from</option>
            <option v-for="year in view.years.value" :key="year" :value="year">
              {{ year }}
            </option>
          </select>
          <span class="tt-muted">–</span>
          <select
            aria-label="To year"
            :value="state.toYear ?? ''"
            @change="setYear('toYear', $event)"
          >
            <option value="">to</option>
            <option v-for="year in view.years.value" :key="year" :value="year">
              {{ year }}
            </option>
          </select>
        </div>
      </div>

      <div>
        <button type="button" class="tt-btn" @click="clear">
          Clear filters
        </button>
      </div>
    </div>
  </details>
</template>

<script setup lang="ts">
import { countFilters, type Outcome } from "@/tournament/filter";
import {
  formatSuggestions,
  playerSuggestions,
  tournamentSuggestions,
  type Suggestion,
} from "@/tournament/suggestions";
import { useTournamentView } from "@/tournament/useTournamentView";

const view = useTournamentView();
const state = view.state;

// on a phone the filters fold away; next to the results they are always open
const wide = useMediaQuery("(min-width: 901px)");
const expanded = ref(false);

const outcomes: [Outcome, string][] = [
  ["any", "Won or lost"],
  ["won", "Won"],
  ["lost", "Lost"],
];

const noFormats = computed(() => {
  if (state.value.tournament) {
    return "All Formats of this Tournament";
  }
  return state.value.player ? "All Formats of this Player" : "None chosen";
});

const formatOptions = (text: string) =>
  formatSuggestions(view.directory.value, text, state.value.formats, 40);
const playerOptions = (text: string) =>
  playerSuggestions(view.players.value, text, state.value.formats, 30);
const tournamentOptions = (text: string) =>
  tournamentSuggestions(view.directory.value, text, state.value.formats, 30);

const addFormat = (pick: Suggestion) =>
  view.update({ formats: [...state.value.formats, pick.value] });
const removeFormat = (format: string) =>
  view.update({
    formats: state.value.formats.filter((entry) => entry !== format),
  });

const otherAlts = computed(() => {
  const player = view.players.value?.get(state.value.player ?? "");
  return (
    player?.alts.filter(
      (alt) => alt.toLowerCase() !== player.name.toLowerCase(),
    ).length ?? 0
  );
});

const rounds = computed(() => [
  ...new Set(
    view.tournament.value?.threads.map((thread) => thread.round) ?? [],
  ),
]);

const categories = computed(() => view.directory.value?.categories ?? []);
const toggleCategory = (category: string) =>
  view.update({
    categories: state.value.categories.includes(category)
      ? state.value.categories.filter((entry) => entry !== category)
      : [...state.value.categories, category],
  });

const setYear = (key: "fromYear" | "toYear", event: Event) => {
  const value = Number((event.target as HTMLSelectElement).value);
  view.update({ [key]: value > 0 ? value : null });
};

const clear = () =>
  view.update({
    has: [],
    against: [],
    outcome: "any",
    player: null,
    tournament: null,
    round: null,
    categories: [],
    fromYear: null,
    toYear: null,
    replay: null,
    formats:
      state.value.formats.length > 0
        ? state.value.formats
        : (view.tournament.value?.formats.map((format) => format.id) ?? []),
  });
</script>
