<template>
  <article class="tt-match" :class="{ open }">
    <div
      class="tt-mrow"
      role="button"
      tabindex="0"
      :aria-expanded="open"
      @click="open = !open"
      @keydown.enter="open = !open"
    >
      <div class="tt-side">
        <div class="tt-who">
          <b :class="{ win: known && match.decided }" :title="sides[0].note">{{
            sides[0].name
          }}</b>
          <span v-if="sides[0].alts" class="as"> as {{ sides[0].alts }}</span>
        </div>
        <div>
          <TeamIcons
            :team="sides[0].team"
            :highlight="view.highlightOf(first.left)"
            :limit="6"
            mirror
          />
          <span v-if="sides[0].more > 0" class="tt-more">
            {{ moreTeams(sides[0].more) }}</span
          >
        </div>
      </div>
      <div class="tt-score">
        <!-- the thread's result counts; when its replays add up to another one, no score is shown -->
        <span
          v-if="known && match.flagged"
          class="w def"
          :title="`The thread names ${sides[0].name} the winner. The replays linked there: ${match.left.wins}–${match.right.wins}.`"
          >def.</span
        >
        <template v-else-if="known">
          <span :class="match.decided ? 'w' : 'l'">{{ match.left.wins }}</span
          ><i>–</i><span class="l">{{ match.right.wins }}</span>
        </template>
        <i v-else>vs</i>
      </div>
      <div class="tt-side r">
        <div class="tt-who">
          <span :title="sides[1].note">{{ sides[1].name }}</span>
          <span v-if="sides[1].alts" class="as"> as {{ sides[1].alts }}</span>
        </div>
        <div>
          <span v-if="sides[1].more > 0" class="tt-more"
            >{{ moreTeams(sides[1].more) }}
          </span>
          <TeamIcons
            :team="sides[1].team"
            :highlight="view.highlightOf(first.right)"
            :limit="6"
          />
        </div>
      </div>
      <div class="tt-mmeta">
        <button
          v-if="showTournament && tournament"
          type="button"
          class="tt-btn link"
          title="Add this Tournament to the filter"
          @click.stop="view.pickTournament(tournament.id)"
        >
          <b>{{ tournament.name }}</b>
        </button>
        <span v-if="showTournament && match.thread?.round">{{
          match.thread.round
        }}</span>
        <span>{{ dateOfDay(match.day) }}</span>
        <span
          >{{ match.games.length }}
          {{ match.games.length === 1 ? "Game" : "Games" }}</span
        >
        <span
          v-if="mixed || showFormat"
          class="tt-pill"
          :title="
            mixed
              ? `This Match was played across several Formats: ${formatNames.join(', ')}`
              : undefined
          "
          >{{ formatsLabel }}</span
        >
        <span
          v-if="!known"
          title="The Showdown names of this Match could not be matched to its Players, so the sides are shown as the replay has them."
          >Thread: {{ playerName(match.left) }} vs
          {{ playerName(match.right) }}</span
        >
        <a
          :href="replayUrl(first.id)"
          target="_blank"
          rel="noopener"
          @click.stop
          >Replay ↗</a
        >
      </div>
    </div>
    <div v-if="open" class="tt-games">
      <div
        v-for="(game, index) in match.games"
        :key="game.id"
        class="tt-game"
        :class="{ off: !inFormats(game) }"
      >
        <h4>
          Game {{ index + 1 }}
          <span v-if="mixed" class="tt-pill">{{
            shortFormatName(view.directory.value, game.format)
          }}</span>
          <span v-if="!inFormats(game)" class="tt-muted tt-small"
            >not in the chosen Formats</span
          >
          <span class="tt-muted tt-small">{{ outcomeOf(game) }}</span>
          <a
            class="tt-small"
            :href="replayUrl(game.id)"
            target="_blank"
            rel="noopener"
            >Replay ↗</a
          >
          <a
            class="tt-small"
            :href="getAnalyzeLink(replayUrl(game.id))"
            target="_blank"
            rel="noopener"
            >Analyze ↗</a
          >
          <a
            class="tt-small"
            :href="threadUrl(match.threadId)"
            target="_blank"
            rel="noopener"
            >Thread ↗</a
          >
        </h4>
        <div class="tt-gsides">
          <div v-for="side in [game.left, game.right]" :key="side.alt">
            <div class="tt-label">{{ side.alt || "?" }}</div>
            <TeamSets
              :team="side.team"
              :highlight="view.highlightOf(side)"
              :mirror="side === game.left"
            />
          </div>
        </div>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import {
  dateOfDay,
  playerName,
  replayUrl,
  shortFormatName,
  threadUrl,
  toId,
  type Game,
  type Match,
  type MatchSide,
} from "@/tournament/model";
import { useTournamentView } from "@/tournament/useTournamentView";
import { getAnalyzeLink } from "@/util/dashboardHelper";

const properties = withDefaults(
  defineProps<{
    match: Match;
    /** Names Tournament and Round in the row; off inside a Tournament's own list, which is grouped by Round. */
    showTournament?: boolean;
    /** Names the Format in the row, for lists across Formats. */
    showFormat?: boolean;
    startOpen?: boolean;
  }>(),
  { showTournament: true, showFormat: false, startOpen: false },
);

const view = useTournamentView();
const open = ref(properties.startOpen);

const tournament = computed(() => properties.match.thread?.tournament ?? null);
const mixed = computed(() => properties.match.formats.length > 1);

const formatNames = computed(() =>
  properties.match.formats.map((id) =>
    shortFormatName(view.directory.value, id),
  ),
);
/** Up to three Formats by name, the rest as a number. */
const formatsLabel = computed(() => {
  const names = formatNames.value;
  return names.length > 3
    ? `${names.slice(0, 3).join(" · ")} +${names.length - 3}`
    : names.join(" · ");
});

const inFormats = (game: Game) => {
  const formats = view.filter.value.formats;
  return formats.length === 0 || formats.includes(game.format);
};

const fitsFilter = (game: Game) =>
  inFormats(game) && game.sides.some((side) => view.fits(side));

/**
 * The Game the row shows: the first with the Team the filter describes, else the first in the chosen
 * Formats; one whose sides are known where there is one.
 */
const first = computed(() => {
  const games = properties.match.games;
  return (
    games.find((game) => fitsFilter(game) && game.attributed) ??
    games.find((game) => fitsFilter(game)) ??
    games.find((game) => inFormats(game) && game.attributed) ??
    games.find((game) => game.attributed) ??
    games.find((game) => inFormats(game)) ??
    games[0]
  );
});
/** Whether the row can say which Player brought which Team. */
const known = computed(() => first.value.attributed);

const showdownNameNote =
  "The thread does not name this Player; this is the Showdown name of the replay.";

const otherAlts = (side: MatchSide) =>
  side.alts.filter((alt) => toId(alt) !== toId(side.player?.name)).join(", ");

const sides = computed(() => {
  const { left, right } = properties.match;
  if (!known.value) {
    // the replay's own sides, under the names the replay has
    return [first.value.left, first.value.right].map((side) => ({
      name: side.alt || "?",
      note: showdownNameNote,
      alts: "",
      team: side.team,
      more: 0,
    }));
  }
  return [
    [left, first.value.left] as const,
    [right, first.value.right] as const,
  ].map(([side, gameSide]) => ({
    // a Match whose thread names only one Player shows the other by the Showdown name
    name: side.player ? playerName(side) : (side.alts[0] ?? "?"),
    note: side.player ? undefined : showdownNameNote,
    alts: side.player ? otherAlts(side) : side.alts.slice(1).join(", "),
    team: gameSide.team ?? side.teams[0] ?? null,
    more: Math.max(side.teams.length - 1, 0),
  }));
});

const moreTeams = (count: number) =>
  `+${count} ${count === 1 ? "Team" : "Teams"}`;

const outcomeOf = (game: Game) => {
  const winner = game.sides.find((side) => side.won);
  return winner ? `${winner.alt || "?"} won` : "no winner in the replay";
};
</script>
