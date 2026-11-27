<template>
  <div class="tt-field">
    <label class="tt-label" for="tt-search">Search</label>
    <SuggestInput
      id="tt-search"
      big
      free-text
      :model-value="view.state.value.text"
      placeholder="Player, Pokémon, Tournament, move, item, Format or a replay link"
      :options="options"
      @update:model-value="typed"
      @submit="apply"
      @pick="pick"
    />
    <span class="tt-muted tt-small"
      >Searches as you type: Players, Showdown names, Tournaments, Rounds,
      Formats and the Teams' Pokémon, moves and items. "vs" searches the other
      side ("LordEnz vs Kingambit"), "-" leaves out. A suggestion turns its
      words into a filter.</span
    >
  </div>
</template>

<script setup lang="ts">
import { pokemonInAll, withConditionsInAll } from "@/tournament/filter";
import {
  conditionOf,
  searchSuggestions,
  type Suggestion,
} from "@/tournament/suggestions";
import { useTournamentView } from "@/tournament/useTournamentView";

/** How long typing has to pause before the search follows. */
const typingPause = 250;

const view = useTournamentView();

const options = (text: string) =>
  searchSuggestions(
    {
      vocabulary: view.vocabulary.value,
      players: view.players.value,
      directory: view.directory.value,
      formats: view.state.value.formats,
      // a pick lands in every alternative, so it is tied only to Pokémon all of them ask for
      carriers: {
        has: view.carriersOf(pokemonInAll(view.state.value.has)),
        against: view.carriersOf(pokemonInAll(view.state.value.against)),
      },
    },
    text,
  );

let timer: ReturnType<typeof setTimeout> | undefined;
onBeforeUnmount(() => clearTimeout(timer));

/** The search follows the text; typing leaves no steps in the browser's history. */
const apply = (text: string) => {
  clearTimeout(timer);
  if (text.trim() !== view.state.value.text) {
    view.update({ text: text.trim() }, undefined, { replace: true });
  }
};

const typed = (text: string) => {
  clearTimeout(timer);
  timer = setTimeout(() => apply(text), typingPause);
};

const pick = (suggestion: Suggestion, exclude: boolean) => {
  clearTimeout(timer);
  const state = view.state.value;
  const text = (suggestion.rest ?? "").trim();
  switch (suggestion.kind) {
    case "player": {
      view.update({ player: suggestion.value, text });
      break;
    }
    case "tournament": {
      view.pickTournament(suggestion.value, { text });
      break;
    }
    case "format": {
      view.update({ formats: [...state.formats, suggestion.value], text });
      break;
    }
    case "replay": {
      view.update({ replay: suggestion.value, tab: "matches", text });
      break;
    }
    default: {
      const which = suggestion.against ? "against" : "has";
      view.update({
        [which]: withConditionsInAll(state[which], [
          conditionOf(suggestion, exclude),
        ]),
        text,
      });
    }
  }
};
</script>
