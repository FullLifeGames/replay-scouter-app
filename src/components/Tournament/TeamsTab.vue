<template>
  <div class="tt-stack" style="gap: 10px">
    <div class="tt-line">
      <div class="tt-seg" role="group" aria-label="Show the Teams as">
        <button
          v-for="[value, label] in representations"
          :key="value"
          type="button"
          :class="{ on: as === value }"
          @click="emit('update:as', value)"
        >
          {{ label }}
        </button>
      </div>
      <button
        v-if="as === 'text' || as === 'json'"
        type="button"
        class="tt-btn"
        @click="copy(as === 'text' ? text : json)"
      >
        Copy
      </button>
      <slot name="controls" />
      <span class="tt-muted tt-small">
        {{ formatCount(uses.length) }}
        {{ uses.length === 1 ? "Team" : "Teams" }} in
        {{ formatCount(gameCount) }} Games. The same Pokémon in one thread are
        one Team.
      </span>
    </div>

    <div v-if="uses.length === 0" class="tt-note">No Teams in this search.</div>

    <template v-else-if="as === 'list'">
      <div
        v-for="use in shownUses"
        :key="use.team.signature + use.sides[0].game.id"
        class="tt-teamrow"
        :class="{ open: opened.has(use.team) }"
      >
        <div
          class="tt-teamhead"
          role="button"
          tabindex="0"
          :aria-expanded="opened.has(use.team)"
          @click="toggle(use.team)"
          @keydown.enter="toggle(use.team)"
        >
          <TeamIcons :team="use.team" :highlight="highlight" />
          <span class="tt-muted tt-small">
            {{ summaryOf(use) }}
          </span>
        </div>
        <div v-if="opened.has(use.team)" class="tt-teambody">
          <div class="tt-two">
            <div>
              <div class="tt-label">Sets</div>
              <TeamSets :team="use.team" :highlight="highlight" />
            </div>
            <div>
              <div class="tt-label">Games</div>
              <div class="tt-replays">
                <div v-for="side in use.sides" :key="side.game.id">
                  <b :class="{ 'tt-wr good': side.won }">{{
                    side.alt || "?"
                  }}</b>
                  vs {{ side.opponent.alt || "?" }}
                  <span class="tt-muted"
                    >· {{ resultOf(side) }} · {{ whereOf(side) }}</span
                  >
                  <a
                    :href="replayUrl(side.game.id)"
                    target="_blank"
                    rel="noopener"
                    >Replay ↗</a
                  >
                  <a
                    :href="getAnalyzeLink(replayUrl(side.game.id))"
                    target="_blank"
                    rel="noopener"
                    >Analyze ↗</a
                  >
                </div>
              </div>
            </div>
          </div>
          <textarea
            v-if="filled.has(use.team)"
            readonly
            rows="14"
            aria-label="The Team with its build filled in"
            :value="filled.get(use.team)"
          />
          <div class="tt-line">
            <button
              type="button"
              class="tt-btn"
              @click="copy(filled.get(use.team) ?? teamToText(apiTeamOf(use)))"
            >
              Copy as text
            </button>
            <button
              v-if="canFill(use) && !filled.has(use.team)"
              type="button"
              class="tt-btn"
              title="Completes the Sets with the closest builds of the Smogon Team Dump"
              @click="fill(use)"
            >
              Fill Build
            </button>
          </div>
        </div>
      </div>
    </template>

    <MonTable
      v-else-if="as === 'table'"
      :scouting-result="null"
      :teams="apiTeams"
    />

    <textarea
      v-else-if="as === 'text'"
      readonly
      rows="30"
      aria-label="Teams as text"
      :value="text"
    />

    <textarea
      v-else
      readonly
      rows="30"
      aria-label="Teams as JSON"
      :value="json"
    />

    <div v-if="shown < uses.length" class="tt-line">
      <button type="button" class="tt-btn" @click="shown += step">
        Show {{ Math.min(step, uses.length - shown) }} more
      </button>
      <button type="button" class="tt-btn" @click="shown = uses.length">
        Show all {{ formatCount(uses.length) }}
      </button>
      <span v-if="as !== 'list'" class="tt-muted tt-small"
        >The
        {{ as === "table" ? "table" : as === "text" ? "text" : "JSON" }} holds
        the first {{ formatCount(shown) }} Teams.</span
      >
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Team as ApiTeam } from "@/api";
import useEmitter from "@/plugins/emitter";
import { teamsJson, teamsText, toApiTeam } from "@/tournament/export";
import type { SortKey, TeamsAs } from "@/tournament/filter";
import {
  dateOfDay,
  formatCount,
  replayUrl,
  type GameSide,
  type Team,
} from "@/tournament/model";
import { sortTeams, teamsOf, type TeamUse } from "@/tournament/query";
import type { Highlight } from "@/tournament/useTournamentView";
import { getAnalyzeLink } from "@/util/dashboardHelper";
import { retrieveSmogonDumpEntry } from "@/util/dumpHelper";
import {
  adaptWithClosestMon,
  findMostSimilarPokemonWithTeams,
} from "@/util/similarityHelper";
import { teamToText } from "@/util/textHelper";

const properties = withDefaults(
  defineProps<{
    /** The sides of a search; each Team among them is shown once, with its Games. */
    sides: GameSide[];
    as: TeamsAs;
    sort: SortKey;
    reversed: boolean;
    /** The first line of the text export. */
    heading: string;
    formatName: (id: string) => string;
    highlight?: Highlight;
    step?: number;
  }>(),
  { highlight: undefined, step: 30 },
);

const emit = defineEmits<{ "update:as": [value: TeamsAs] }>();

const emitter = useEmitter();

const representations: [TeamsAs, string][] = [
  ["list", "List"],
  ["table", "Table"],
  ["text", "Text"],
  ["json", "JSON"],
];

const uses = computed(() =>
  sortTeams(
    teamsOf(properties.sides),
    properties.sort,
    properties.reversed,
    properties.formatName,
  ),
);
const gameCount = computed(
  () => new Set(properties.sides.map((side) => side.game)).size,
);

const shown = ref(properties.step);
watch(uses, () => {
  shown.value = properties.step;
});
const shownUses = computed(() => uses.value.slice(0, shown.value));

const apiTeamOf = (use: TeamUse) => toApiTeam(use, properties.formatName);
const apiTeams = computed<ApiTeam[]>(() =>
  shownUses.value.map((use) => apiTeamOf(use)),
);
const text = computed(() =>
  properties.as === "text" ? teamsText(properties.heading, apiTeams.value) : "",
);
const json = computed(() =>
  properties.as === "json" ? teamsJson(apiTeams.value) : "",
);

const opened = ref(new Set<Team>());
const toggle = (team: Team) => {
  const next = new Set(opened.value);
  if (!next.delete(team)) {
    next.add(team);
  }
  opened.value = next;
};

const resultOf = (side: GameSide) => {
  if (side.won) {
    return "won";
  }
  return side.opponent.won ? "lost" : "no winner";
};

/** Round and day of the Game; the Tournament is in the Team's own line. */
const whereOf = (side: GameSide) => {
  const { thread, day } = side.game.match;
  return [thread?.round ?? "", dateOfDay(day)]
    .filter((part) => part !== "")
    .join(", ");
};

const summaryOf = (use: TeamUse) => {
  const won = use.sides.filter((side) => side.won).length;
  const lost = use.sides.filter((side) => side.opponent.won).length;
  const names = [
    ...new Set(use.sides.map((side) => side.player?.name ?? side.alt)),
  ].filter((name) => name !== "");
  const formats = [
    ...new Set(
      use.sides.map((side) => properties.formatName(side.game.format)),
    ),
  ];
  const who =
    names.length > 3
      ? `${names.slice(0, 3).join(", ")} +${names.length - 3}`
      : names.join(", ");
  const games = `${use.sides.length} ${use.sides.length === 1 ? "Game" : "Games"}`;
  const thread = use.sides[0].game.match.thread;
  return [
    `${games}, ${won}–${lost}`,
    who,
    thread?.tournament.name ?? "",
    formats.join(", "),
    dateOfDay(use.sides[0].game.match.day),
  ]
    .filter((part) => part !== "")
    .join(" · ");
};

const copy = (value: string) => {
  navigator.clipboard?.writeText(value).catch(() => {});
};

// "Fill Build": the Sets completed with the closest builds of the Smogon Team Dump
const filled = ref(new Map<Team, string>());
const canFill = (use: TeamUse) => use.sides[0].game.format.includes("gen");
const fill = async (use: TeamUse) => {
  emitter.emit("asyncComponentLoading");
  try {
    const [dumpTeams] = await retrieveSmogonDumpEntry(
      `${use.sides[0].game.format}.json`,
    );
    const team = apiTeamOf(use);
    for (const mon of team.pokemon ?? []) {
      const closest = findMostSimilarPokemonWithTeams(mon, dumpTeams);
      if (closest) {
        adaptWithClosestMon(mon, closest);
      }
    }
    team.complete = true;
    filled.value = new Map(filled.value).set(use.team, teamToText(team));
  } catch {
    filled.value = new Map(filled.value).set(
      use.team,
      "The Smogon Team Dump has no builds for this Format.",
    );
  } finally {
    emitter.emit("asyncComponentLoaded");
  }
};
</script>
