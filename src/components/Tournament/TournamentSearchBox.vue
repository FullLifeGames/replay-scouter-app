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
      excludes it.</span
    >
  </div>
</template>

<script setup lang="ts">
import { withConditionsInAll } from "@/tournament/filter";
import type { TokenKind } from "@/tournament/model";
import { searchSuggestions, type Suggestion } from "@/tournament/suggestions";
import { useTournamentView } from "@/tournament/useTournamentView";

const view = useTournamentView();

const options = (text: string) =>
  searchSuggestions(
    {
      vocabulary: view.vocabulary.value,
      players: view.players.value,
      directory: view.directory.value,
      formats: view.state.value.formats,
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
          {
            kind: suggestion.kind as TokenKind,
            name: suggestion.value,
            exclude,
          },
        ]),
      });
    }
  }
};
</script>
