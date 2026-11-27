/**
 * The state of the page: what is searched for and how it is shown. All of it lives in the URL, so a
 * link reproduces the page; `parseState` and `toQuery` are the two directions.
 */
import type { TokenKind } from "./model";

/** One thing a Team has or, with `exclude`, does not have; `on` ties a move, item, ability or Tera type to a Pokémon. */
export interface Condition {
  kind: TokenKind;
  name: string;
  on?: string;
  exclude: boolean;
}

/** Alternatives: a Team fits when it meets every Condition of one of the groups. */
export type Conditions = Condition[][];

export type Outcome = "any" | "won" | "lost";
export type Tab = "matches" | "teams" | "stats" | "tournaments";
export type SortKey =
  | "date"
  | "format"
  | "player"
  | "games"
  | "rating"
  | "views";
export type TeamsAs = "list" | "table" | "text" | "json";

export interface Filter {
  /**
   * Format ids. None means all Formats: those of the Tournament or the Player when one is chosen, else
   * those of the Tournaments loaded so far, newest first.
   */
  formats: string[];
  /** Free text: words a Team's side has to show; after "vs", words of the other side; "-" leaves out. */
  text: string;
  has: Conditions;
  against: Conditions;
  /** Whether the Team that `has` describes won or lost its Game. */
  outcome: Outcome;
  /** A Player's key. */
  player: string | null;
  /** Tournament ids: Matches of any of them. */
  tournaments: string[];
  /** A Round's name, such as "Finals", in any of the chosen Tournaments. */
  round: string | null;
  fromYear: number | null;
  toYear: number | null;
}

export interface State extends Filter {
  tab: Tab;
  sort: SortKey;
  /** Sorts against the key's usual direction (see `sortKeys`). */
  reversed: boolean;
  teamsAs: TeamsAs;
  /** With Tournaments chosen, the Matches tab groups them by Tournament and Round. */
  byRound: boolean;
  /** The Format the Stats tab shows when several are chosen. */
  statsFormat: string | null;
  statsTable: string;
  /** A replay id: its Match is shown on top. */
  replay: string | null;
}

export const sortKeys: { key: SortKey; label: string; usual: string }[] = [
  { key: "date", label: "Date", usual: "newest first" },
  { key: "format", label: "Format", usual: "A to Z" },
  { key: "player", label: "Player", usual: "A to Z" },
  { key: "games", label: "Number of Games", usual: "most first" },
  { key: "rating", label: "Rating", usual: "highest first" },
  { key: "views", label: "Views", usual: "most first" },
];

export const kindLabels: Record<TokenKind, string> = {
  pokemon: "Pokémon",
  move: "Move",
  item: "Item",
  ability: "Ability",
  tera: "Tera",
  lead: "Lead",
};

const kinds = Object.keys(kindLabels) as TokenKind[];
const tabs = new Set<Tab>(["matches", "teams", "stats", "tournaments"]);
const teamsAsValues = new Set<TeamsAs>(["list", "table", "text", "json"]);

export const emptyFilter = (): Filter => ({
  formats: [],
  text: "",
  has: [],
  against: [],
  outcome: "any",
  player: null,
  tournaments: [],
  round: null,
  fromYear: null,
  toYear: null,
});

export const defaultState = (): State => ({
  ...emptyFilter(),
  tab: "matches",
  sort: "date",
  reversed: false,
  teamsAs: "list",
  byRound: false,
  statsFormat: null,
  statsTable: "overview",
  replay: null,
});

// ---------------------------------------------------------------- free text

/** The words of a free text: runs of non-space, a quoted phrase as one word ("Great Tusk"). */
export const splitText = (text: string): string[] =>
  text.match(/-?"[^"]*"?|\S+/g) ?? [];

/** A word of a free text without quotes and without a leading "-". */
export const bareWord = (word: string) =>
  word.replace(/^-/, "").replaceAll('"', "");

/** "vs" between words: what follows describes the other side. */
export const isVs = (word: string) => word.toLowerCase() === "vs";

// ---------------------------------------------------------------- Conditions as text

/** "Kingambit", "-Great Tusk", "move:Sucker Punch", "item:Leftovers@Kingambit". */
export const conditionText = (condition: Condition) => {
  const kind = condition.kind === "pokemon" ? "" : `${condition.kind}:`;
  const on = condition.on ? `@${condition.on}` : "";
  return `${condition.exclude ? "-" : ""}${kind}${condition.name}${on}`;
};

export const parseCondition = (text: string): Condition | null => {
  let rest = text.trim();
  const exclude = rest.startsWith("-");
  if (exclude) {
    rest = rest.slice(1).trim();
  }
  let kind: TokenKind = "pokemon";
  const colon = rest.indexOf(":");
  if (colon > 0) {
    const prefix = rest.slice(0, colon).toLowerCase() as TokenKind;
    // "Type: Null" is a Pokémon, not a kind
    if (kinds.includes(prefix)) {
      kind = prefix;
      rest = rest.slice(colon + 1).trim();
    }
  }
  let on: string | undefined;
  const at = rest.lastIndexOf("@");
  if (at > 0 && kind !== "pokemon" && kind !== "lead") {
    on = rest.slice(at + 1).trim() || undefined;
    rest = rest.slice(0, at).trim();
  }
  if (!rest) {
    return null;
  }
  return on ? { kind, name: rest, on, exclude } : { kind, name: rest, exclude };
};

const conditionsText = (conditions: Conditions) =>
  conditions
    .filter((group) => group.length > 0)
    .map((group) => group.map((entry) => conditionText(entry)).join(","))
    .join("~");

const parseConditions = (text: string): Conditions => {
  const groups: Conditions = [];
  for (const part of text.split("~")) {
    const group: Condition[] = [];
    for (const entry of part.split(",")) {
      const condition = parseCondition(entry);
      if (condition) {
        group.push(condition);
      }
    }
    if (group.length > 0) {
      groups.push(group);
    }
  }
  return groups;
};

/**
 * The Pokémon a group asks for, the one asked for last first: what a move, item, ability or Tera type
 * can be tied to. A Condition tied to a Pokémon asks for that Pokémon too.
 */
export const pokemonOf = (group: Condition[]): string[] => {
  const names = new Map<string, string>();
  for (const condition of group) {
    if (condition.exclude) {
      continue;
    }
    const name =
      condition.kind === "pokemon" || condition.kind === "lead"
        ? condition.name
        : condition.on;
    if (name) {
      names.delete(name.toLowerCase());
      names.set(name.toLowerCase(), name);
    }
  }
  return [...names.values()].reverse();
};

/** The Pokémon every alternative asks for: what a Condition required in all of them can be tied to. */
export const pokemonInAll = (conditions: Conditions): string[] => {
  const [first = [], ...others] = conditions.map((group) => pokemonOf(group));
  return first.filter((name) =>
    others.every((names) =>
      names.some((other) => other.toLowerCase() === name.toLowerCase()),
    ),
  );
};

export const sameCondition = (a: Condition, b: Condition) =>
  a.kind === b.kind &&
  a.name.toLowerCase() === b.name.toLowerCase() &&
  (a.on ?? "").toLowerCase() === (b.on ?? "").toLowerCase();

/** The groups with the Condition in group `group`; one past the last group starts an alternative. */
export const withCondition = (
  conditions: Conditions,
  group: number,
  condition: Condition,
): Conditions => {
  const groups = conditions.map((entries) => [...entries]);
  const target = groups[group] ?? [];
  if (group >= groups.length) {
    groups.push(target);
  }
  const known = target.findIndex((entry) => sameCondition(entry, condition));
  if (known === -1) {
    target.push(condition);
  } else {
    target[known] = condition;
  }
  return groups;
};

/** The groups with the Conditions required in every alternative: what a click on a statistics row asks for. */
export const withConditionsInAll = (
  conditions: Conditions,
  added: Condition[],
): Conditions => {
  let groups = conditions.length > 0 ? conditions : [[]];
  for (const condition of added) {
    for (const index of groups.keys()) {
      groups = withCondition(groups, index, condition);
    }
  }
  return groups;
};

export const withoutCondition = (
  conditions: Conditions,
  group: number,
  index: number,
): Conditions =>
  conditions
    .map((entries, position) =>
      position === group
        ? entries.filter((_, entryIndex) => entryIndex !== index)
        : entries,
    )
    .filter((entries) => entries.length > 0);

export const withToggledCondition = (
  conditions: Conditions,
  group: number,
  index: number,
): Conditions =>
  conditions.map((entries, position) =>
    position === group
      ? entries.map((entry, entryIndex) =>
          entryIndex === index ? { ...entry, exclude: !entry.exclude } : entry,
        )
      : entries,
  );

// ---------------------------------------------------------------- URL

export type Query = Record<string, string>;

const list = (text: string | undefined) =>
  (text ?? "")
    .split(",")
    .map((entry) => entry.trim())
    .filter((entry) => entry !== "");

const year = (text: string | undefined) => {
  const value = Number.parseInt(text ?? "", 10);
  return Number.isInteger(value) && value > 1990 && value < 2200 ? value : null;
};

const first = (value: unknown): string | undefined => {
  const entry = Array.isArray(value) ? value[0] : value;
  return typeof entry === "string" ? entry : undefined;
};

/** `f` when no Format is chosen: all Formats, of the latest Tournaments first. */
const allFormats = "all";

/** The state a URL query describes; anything missing or unreadable falls back to the default. */
export const parseState = (query: Record<string, unknown>): State => {
  const state = defaultState();
  state.formats = [
    ...new Set(
      list(first(query.f))
        .map((id) => id.toLowerCase())
        .filter((id) => id !== allFormats),
    ),
  ];
  state.text = first(query.q)?.trim() ?? "";
  state.has = parseConditions(first(query.has) ?? "");
  state.against = parseConditions(first(query.vs) ?? "");
  const outcome = first(query.res);
  if (outcome === "won" || outcome === "lost") {
    state.outcome = outcome;
  }
  state.player = first(query.p) || null;
  state.tournaments = [...new Set(list(first(query.t)))];
  state.round =
    state.tournaments.length === 0 ? null : (first(query.r) ?? null);
  const years = (first(query.y) ?? "").split("-");
  state.fromYear = year(years[0]);
  state.toYear = year(years[1]);
  const tab = first(query.tab) as Tab;
  if (tabs.has(tab)) {
    state.tab = tab;
  }
  const sort = sortKeys.find((entry) => entry.key === first(query.sort));
  if (sort) {
    state.sort = sort.key;
  }
  state.reversed = first(query.rev) === "1";
  state.byRound = first(query.g) === "round";
  const teamsAs = first(query.as) as TeamsAs;
  if (teamsAsValues.has(teamsAs)) {
    state.teamsAs = teamsAs;
  }
  state.statsFormat = first(query.sf) || null;
  state.statsTable = first(query.st) || "overview";
  state.replay = first(query.m) || null;
  return state;
};

/** The shortest URL query for a state: defaults are left out. */
export const toQuery = (state: State): Query => {
  const query: Query = {};
  const set = (key: string, value: string | null, usual = "") => {
    if (value !== null && value !== usual) {
      query[key] = value;
    }
  };
  // without a Format the query says which Formats, so that it never is the bare URL that opens the last ones
  set(
    "f",
    state.formats.length > 0 ||
      state.tournaments.length > 0 ||
      state.player !== null
      ? state.formats.join(",")
      : allFormats,
  );
  set("q", state.text.trim());
  set("has", conditionsText(state.has));
  set("vs", conditionsText(state.against));
  set("res", state.outcome, "any");
  set("p", state.player);
  set("t", state.tournaments.join(","));
  set("r", state.tournaments.length === 0 ? null : state.round);
  if (state.fromYear !== null || state.toYear !== null) {
    query.y = `${state.fromYear ?? ""}-${state.toYear ?? ""}`;
  }
  set("tab", state.tab, "matches");
  set("sort", state.sort, "date");
  set("rev", state.reversed ? "1" : "");
  set("as", state.teamsAs, "list");
  set("g", state.byRound ? "round" : "");
  set("sf", state.statsFormat);
  set("st", state.statsTable, "overview");
  set("m", state.replay);
  return query;
};

/** How many filters are set, for the "Filters (3 set)" line on a phone. */
export const countFilters = (filter: Filter) =>
  filter.formats.length +
  filter.has.flat().length +
  filter.against.flat().length +
  (filter.outcome === "any" ? 0 : 1) +
  (filter.player === null ? 0 : 1) +
  filter.tournaments.length +
  (filter.fromYear === null && filter.toYear === null ? 0 : 1);

/**
 * The replay id in what someone pasted: a replay link or a bare id such as "gen9ou-2301234567" or
 * "smogtours-gen7ou-848706"; null for anything else.
 */
export const replayIdOf = (text: string): string | null => {
  const trimmed = text.trim();
  const link = /replay\.pokemonshowdown\.com\/([^\s#/?]+)/i.exec(trimmed);
  const id = (link ? link[1] : trimmed).replace(/\.(json|log)$/i, "");
  return /^(?:[\da-z]+-){1,2}\d{4,}(?:-[\da-z]+pw)?$/i.test(id)
    ? id.toLowerCase()
    : null;
};

/** The Format a replay id names: "gen7ou" for "smogtours-gen7ou-848706". */
export const formatOfReplay = (replayId: string): string | null => {
  const parts = replayId.replace(/-[\da-z]+pw$/i, "").split("-");
  return parts.length >= 2 ? parts.at(-2)!.toLowerCase() : null;
};
