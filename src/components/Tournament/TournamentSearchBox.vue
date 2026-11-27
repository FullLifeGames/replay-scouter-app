<template>
  <div class="tt-field">
    <label class="tt-label" for="tt-search">Search</label>
    <SuggestInput
      id="tt-search"
      big
      placeholder="Pokémon, Player, Tournament, move, item, Format or a replay link"
      :options="options"
      @pick="pick"
    />
    <span class="tt-muted tt-small"
      >A pick lands in the matching filter. "vs " puts it on the other side, "-"
      excludes it. Once a Pokémon is picked, its moves, items, abilities and
      Tera types are also offered on that Pokémon.</span
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

const pick = (suggestion: Suggestion, exclude: boolean) => {
  const state = view.state.value;
  switch (suggestion.kind) {
    case "player": {
      view.update({ player: suggestion.value });
      break;
    }
    case "tournament": {
      view.pickTournament(suggestion.value);
      break;
    }
    case "format": {
      view.update({ formats: [...state.formats, suggestion.value] });
      break;
    }
    case "replay": {
      view.update({ replay: suggestion.value, tab: "matches" });
      break;
    }
    default: {
      const which = suggestion.against ? "against" : "has";
      view.update({
        [which]: withConditionsInAll(state[which], [
          conditionOf(suggestion, exclude),
        ]),
      });
    }
  }
};
</script>
