/**
 * The new Tournament Teams page behind its components: the state in the URL, the files it needs for
 * that state, and the search result. The page provides one view; its components inject it.
 */
import {
  computed,
  inject,
  onScopeDispose,
  provide,
  ref,
  shallowRef,
  watch,
  type ComputedRef,
  type InjectionKey,
  type Ref,
  type ShallowRef,
} from "vue";
import { useRoute, useRouter } from "vue-router";
import useEmitter from "@/plugins/emitter";
import {
  loadFormat,
  loadIndex,
  loadPlayers,
  loadTournament,
  loadTournaments,
  type MatchesFile,
} from "./files";
import {
  formatOfReplay,
  parseState,
  toQuery,
  type Conditions,
  type Filter,
  type Query,
  type State,
} from "./filter";
import {
  buildDirectory,
  buildPlayers,
  createPool,
  decodeMatches,
  formatName,
  toId,
  type Directory,
  type Game,
  type GameSide,
  type Match,
  type PlayerEntry,
  type Tournament,
} from "./model";
import { gamesInFormats, search, sortMatches, type Result } from "./query";
import { vocabularyOf, type Vocabulary } from "./statistics";

export const routeName = "TournamentTeams";

const lastFormatsKey = "tournamentTeams.formats";
const firstVisitFormats = "gen9ou";
const toastSeconds = 9;

export interface Toast {
  text: string;
  /** The URL query to go back to. */
  undo: Query;
}

export type Highlight = Map<string, "has" | "against">;

/** The Match a pasted replay belongs to. */
export interface OpenedReplay {
  id: string;
  status: "loading" | "found" | "missing";
  match: Match | null;
}

export interface TournamentView {
  state: ComputedRef<State>;
  filter: ComputedRef<Filter>;
  /** Changes the state through the URL; with `undoText`, offers to take the change back. */
  update: (patch: Partial<State>, undoText?: string) => void;
  toast: Ref<Toast | null>;
  undo: () => void;

  directory: ShallowRef<Directory | null>;
  players: ShallowRef<Map<string, PlayerEntry> | null>;
  loading: Ref<boolean>;
  failure: Ref<string | null>;
  /** No Format, Tournament or Player is chosen: all Formats together are too much to load. */
  needsNarrowing: ComputedRef<boolean>;

  result: ComputedRef<Result>;
  sortedMatches: ComputedRef<Match[]>;
  /** The Pokémon "Team has" asks for, by id; what the Teams tab marks, which shows only such Teams. */
  highlight: ComputedRef<Highlight>;
  /**
   * What to mark on one side of a Game: the Pokémon "Team has" asks for where the side is the Team the
   * filter describes, those of "Against a Team with" where it faces that Team.
   */
  highlightOf: (side: GameSide) => Highlight | undefined;
  /** Whether the side is the Team the filter describes; false for every side while no Team filter is set. */
  fits: (side: GameSide) => boolean;
  /** What the loaded Games in the chosen Formats hold, for suggestions. */
  vocabulary: ComputedRef<Vocabulary>;
  tournament: ComputedRef<Tournament | null>;
  opened: ShallowRef<OpenedReplay | null>;
  years: ComputedRef<number[]>;

  formatName: (id: string) => string;
  playerName: (key: string) => string;
  pickTournament: (id: string) => void;
  clearTournament: () => void;
}

const viewKey: InjectionKey<TournamentView> = Symbol("tournament view");

const remembered = () => {
  try {
    return localStorage.getItem(lastFormatsKey) || firstVisitFormats;
  } catch {
    return firstVisitFormats;
  }
};

const remember = (formats: string) => {
  try {
    localStorage.setItem(lastFormatsKey, formats);
  } catch {
    // private windows may refuse storage; the page works without it
  }
};

const messageOf = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

const sameReplay = (game: Game, replayId: string) => {
  const id = game.id.toLowerCase();
  // a private replay's id carries its password
  return id === replayId || id.startsWith(`${replayId}-`);
};

export const provideTournamentView = (): TournamentView => {
  const route = useRoute();
  const router = useRouter();
  const emitter = useEmitter();
  const onPage = () => route.name === routeName;

  // ---- state
  const state = computed(() => parseState(route.query));
  const filterKey = computed(() => {
    const current = state.value;
    const filter: Filter = {
      formats: current.formats,
      has: current.has,
      against: current.against,
      outcome: current.outcome,
      player: current.player,
      tournament: current.tournament,
      round: current.round,
      categories: current.categories,
      fromYear: current.fromYear,
      toYear: current.toYear,
    };
    return JSON.stringify(filter);
  });
  // changes only when a filter changes, not with the tab or the order
  const filter = computed(() => JSON.parse(filterKey.value) as Filter);
  const formatsKey = computed(() => filter.value.formats.join(","));

  const toast = ref<Toast | null>(null);
  let toastTimer: ReturnType<typeof setTimeout> | undefined;
  const showToast = (value: Toast | null) => {
    clearTimeout(toastTimer);
    toast.value = value;
    if (value) {
      toastTimer = setTimeout(() => {
        toast.value = null;
      }, toastSeconds * 1000);
    }
  };
  onScopeDispose(() => clearTimeout(toastTimer));

  const update = (patch: Partial<State>, undoText?: string) => {
    const before = toQuery(state.value);
    const next = { ...state.value, ...patch };
    if (next.tournament === null) {
      next.round = null;
    }
    router.push({ query: toQuery(next) });
    showToast(undoText ? { text: undoText, undo: before } : null);
  };
  const undo = () => {
    if (toast.value) {
      router.push({ query: toast.value.undo });
      showToast(null);
    }
  };

  // A bare URL opens the Formats used last time.
  watch(
    () => route.query,
    (query) => {
      if (onPage() && Object.keys(query).length === 0) {
        router.replace({ query: { f: remembered() } });
      }
    },
    { immediate: true },
  );
  watch(formatsKey, (formats) => {
    if (onPage() && formats !== "") {
      remember(formats);
    }
  });

  // ---- files
  const directory = shallowRef<Directory | null>(null);
  const players = shallowRef<Map<string, PlayerEntry> | null>(null);
  const matches = shallowRef<Match[]>([]);
  const loading = ref(false);
  const failure = ref<string | null>(null);
  const pool = createPool();

  const directoryReady = (async () => {
    const [index, tournaments] = await Promise.all([
      loadIndex(),
      loadTournaments(),
    ]);
    directory.value = buildDirectory(index, tournaments);
    return directory.value;
  })();
  const playersReady = (async () => {
    players.value = buildPlayers(await loadPlayers());
    return players.value;
  })();
  // both are awaited where they are needed; a failure shows there
  directoryReady.catch(() => {});
  playersReady.catch(() => {});

  /** Which files the filter needs: a Tournament's own file, else the chosen Formats, else the Player's Formats. */
  const source = computed(() => {
    const { tournament, formats, player } = filter.value;
    if (tournament !== null) {
      return `t:${tournament}`;
    }
    if (formats.length > 0) {
      return `f:${formats.join(",")}`;
    }
    return player === null ? "" : `p:${player}`;
  });
  const needsNarrowing = computed(() => source.value === "");

  const filesOf = async (key: string): Promise<MatchesFile[]> => {
    const value = key.slice(2);
    if (key.startsWith("t:")) {
      return [await loadTournament(value)];
    }
    if (key.startsWith("f:")) {
      return Promise.all(value.split(",").map((id) => loadFormat(id)));
    }
    const known = await playersReady;
    const formats = known.get(value)?.formats ?? [];
    return Promise.all(formats.map((format) => loadFormat(format.id)));
  };

  const decodeAll = (files: MatchesFile[], known: Directory) => {
    const unique = new Set<Match>();
    for (const file of files) {
      for (const match of decodeMatches(file, known, pool)) {
        unique.add(match);
      }
    }
    return [...unique];
  };

  let request = 0;
  const load = async (key: string) => {
    const current = ++request;
    failure.value = null;
    if (key === "") {
      matches.value = [];
      loading.value = false;
      return;
    }
    loading.value = true;
    emitter.emit("asyncComponentLoading");
    try {
      const known = await directoryReady;
      const files = await filesOf(key);
      if (current === request) {
        matches.value = decodeAll(files, known);
      }
    } catch (error) {
      if (current === request) {
        matches.value = [];
        failure.value = messageOf(error);
      }
    } finally {
      emitter.emit("asyncComponentLoaded");
      if (current === request) {
        loading.value = false;
      }
    }
  };
  watch(source, load, { immediate: true });

  // ---- result
  const formatNameOf = (id: string) => formatName(directory.value, id);
  const result = computed(() => search(matches.value, filter.value));
  const order = computed(() => ({
    key: state.value.sort,
    reversed: state.value.reversed,
  }));
  const sortedMatches = computed(() =>
    sortMatches(
      result.value.matches,
      order.value.key,
      order.value.reversed,
      filter.value.formats,
      formatNameOf,
    ),
  );
  const vocabulary = computed(() => {
    const formats = formatsKey.value === "" ? [] : formatsKey.value.split(",");
    const sides: GameSide[] = [];
    for (const match of matches.value) {
      for (const game of gamesInFormats(match, formats)) {
        sides.push(game.sides[0], game.sides[1]);
      }
    }
    return vocabularyOf(sides);
  });
  const marksOf = (conditions: Conditions, mark: "has" | "against") => {
    const marks: Highlight = new Map();
    for (const condition of conditions.flat()) {
      if (
        !condition.exclude &&
        (condition.kind === "pokemon" || condition.kind === "lead")
      ) {
        marks.set(toId(condition.name), mark);
      }
    }
    return marks;
  };
  const highlight = computed(() => marksOf(filter.value.has, "has"));
  const againstMarks = computed(() => marksOf(filter.value.against, "against"));
  const bothMarks = computed<Highlight>(
    () => new Map([...againstMarks.value, ...highlight.value]),
  );
  // the sides of the result are the Teams the filter describes once it has a Team filter
  const fitting = computed(() =>
    filter.value.has.length + filter.value.against.length > 0
      ? new Set(result.value.sides)
      : new Set<GameSide>(),
  );
  const fits = (side: GameSide) => fitting.value.has(side);
  const highlightOf = (side: GameSide) => {
    const described = fitting.value.has(side);
    const facing = fitting.value.has(side.opponent);
    if (described) {
      return facing ? bothMarks.value : highlight.value;
    }
    return facing ? againstMarks.value : undefined;
  };
  const tournament = computed(() =>
    filter.value.tournament === null
      ? null
      : (directory.value?.tournamentsById.get(filter.value.tournament) ?? null),
  );
  const years = computed(() => {
    let first = Number.POSITIVE_INFINITY;
    let last = 0;
    for (const entry of directory.value?.tournaments ?? []) {
      if (entry.year !== null) {
        first = Math.min(first, entry.year);
        last = Math.max(last, entry.year);
      }
    }
    const list: number[] = [];
    for (let year = last; year >= first; year--) {
      list.push(year);
    }
    return list;
  });

  // ---- the Match of a pasted replay
  const opened = shallowRef<OpenedReplay | null>(null);
  const findReplay = (candidates: Match[], replayId: string) =>
    candidates.find((match) =>
      match.games.some((game) => sameReplay(game, replayId)),
    ) ?? null;
  let replayRequest = 0;
  const open = async (replayId: string | null) => {
    const current = ++replayRequest;
    if (replayId === null) {
      opened.value = null;
      return;
    }
    const id = replayId.toLowerCase();
    let match = findReplay(matches.value, id);
    if (match === null) {
      opened.value = { id, status: "loading", match: null };
      const format = formatOfReplay(id);
      try {
        const known = await directoryReady;
        if (format !== null && known.formatsById.has(format)) {
          match = findReplay(decodeAll([await loadFormat(format)], known), id);
        }
      } catch {
        match = null;
      }
    }
    if (current === replayRequest) {
      opened.value = { id, status: match ? "found" : "missing", match };
    }
  };
  watch(() => state.value.replay, open, { immediate: true });

  // ---- actions
  const playerName = (key: string) =>
    players.value?.get(key)?.name ?? pool.players.get(key)?.name ?? key;

  const pickTournament = (id: string) => {
    // keep the chosen Formats the Tournament was played in; none of them means all of its Formats
    const played = new Set(
      directory.value?.tournamentsById
        .get(id)
        ?.formats.map((format) => format.id),
    );
    update({
      tournament: id,
      round: null,
      formats: state.value.formats.filter((format) => played.has(format)),
      tab: "matches",
    });
  };
  const clearTournament = () => {
    // leaving a Tournament with no Format chosen: keep looking at the Formats it was played in
    const formats =
      state.value.formats.length > 0
        ? state.value.formats
        : (tournament.value?.formats.map((format) => format.id) ?? []);
    update({ tournament: null, round: null, formats });
  };

  const view: TournamentView = {
    state,
    filter,
    update,
    toast,
    undo,
    directory,
    players,
    loading,
    failure,
    needsNarrowing,
    result,
    sortedMatches,
    highlight,
    highlightOf,
    fits,
    vocabulary,
    tournament,
    opened,
    years,
    formatName: formatNameOf,
    playerName,
    pickTournament,
    clearTournament,
  };
  provide(viewKey, view);
  return view;
};

export const useTournamentView = (): TournamentView => {
  const view = inject(viewKey);
  if (!view) {
    throw new Error("No tournament view is provided above this component");
  }
  return view;
};
