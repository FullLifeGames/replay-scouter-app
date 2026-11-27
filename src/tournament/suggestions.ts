/**
 * What the search box and the filter inputs offer while someone types: Pokémon, moves, items,
 * abilities, Tera types and leads of the loaded Games, Players, Tournaments and Formats.
 */
import {
  bareWord,
  isVs,
  kindLabels,
  replayIdOf,
  splitText,
  type Condition,
} from "./filter";
import {
  toId,
  type Directory,
  type PlayerEntry,
  type TokenKind,
} from "./model";
import type { CarriedKind, Carrier, Vocabulary } from "./statistics";

export interface Suggestion {
  kind: TokenKind | "player" | "tournament" | "format" | "replay";
  /** A name, a Player's key, a Tournament's or Format's id, or a replay id. */
  value: string;
  label: string;
  /** Shown small behind the label. */
  detail?: string;
  /** A Pokémon whose icon stands before the label. */
  icon?: string;
  count?: number;
  /** A heading above the first suggestion of a group. */
  group?: string;
  /** The pick describes the other side ("vs Kingambit"). */
  against?: boolean;
  /** The Pokémon the pick is tied to: "Stealth Rock on Garchomp" finds only Teams whose Garchomp has it. */
  on?: string;
  /** From the search box: the pick leaves out what it is ("-Kingambit"). */
  exclude?: boolean;
  /** From the search box: the text that stays once the words the pick stands for are taken out. */
  rest?: string;
}

/** The Condition a pick from a "Team has" input asks for. */
export const conditionOf = (
  suggestion: Suggestion,
  exclude: boolean,
): Condition => {
  const kind = suggestion.kind as TokenKind;
  const name = suggestion.value;
  return suggestion.on
    ? { kind, name, on: suggestion.on, exclude }
    : { kind, name, exclude };
};

const ids = new Map<string, string>();
const idOf = (text: string) => {
  let id = ids.get(text);
  if (id === undefined) {
    id = toId(text);
    ids.set(text, id);
  }
  return id;
};

/** 2 when the text starts with the query, 1 when it holds it, 0 when it does not; an empty query fits all. */
const fit = (query: string, text: string) => {
  if (query === "") {
    return 1;
  }
  const position = idOf(text).indexOf(query);
  if (position === -1) {
    return 0;
  }
  return position === 0 ? 2 : 1;
};

const best = <T extends { count?: number }>(
  entries: { entry: T; fit: number }[],
  limit: number,
) =>
  entries
    .sort(
      (a, b) => b.fit - a.fit || (b.entry.count ?? 0) - (a.entry.count ?? 0),
    )
    .slice(0, limit)
    .map((item) => item.entry);

const groupNames: Record<TokenKind, string> = {
  pokemon: "Pokémon",
  move: "Moves",
  item: "Items",
  ability: "Abilities",
  tera: "Tera types",
  lead: "Leads",
};

/** The entries of one kind that fit, most used first. */
export const teamSuggestions = (
  vocabulary: Vocabulary,
  kind: TokenKind,
  text: string,
  limit: number,
): Suggestion[] => {
  const query = toId(text);
  const found: { entry: Suggestion; fit: number }[] = [];
  for (const [name, count] of vocabulary[kind]) {
    const fits = fit(query, name);
    if (fits > 0) {
      const pokemon = kind === "pokemon" || kind === "lead";
      found.push({
        fit: fits,
        entry: {
          kind,
          value: name,
          label: kind === "tera" ? `Tera ${name}` : name,
          detail: kind === "lead" ? "as lead" : undefined,
          icon: pokemon ? name : undefined,
          count,
          group: groupNames[kind],
        },
      });
    }
  }
  return best(found, limit);
};

const carriedKinds: CarriedKind[] = ["move", "item", "ability", "tera"];
const mostCarriers = 3;

/**
 * What the Pokémon a Team is already asked to have carried, under "On Garchomp": such a pick ties the
 * move, item, ability or Tera type to that Pokémon. At most `limit` per Pokémon, most used first; of one
 * kind when `kind` names it, and then also before anything is typed.
 */
export const tiedSuggestions = (
  carriers: Carrier[],
  kind: TokenKind | null,
  text: string,
  limit: number,
): Suggestion[] => {
  const query = toId(text);
  if (query === "" && kind === null) {
    return [];
  }
  return carriers.slice(0, mostCarriers).flatMap((carrier) => {
    const found: { entry: Suggestion; fit: number }[] = [];
    for (const carriedKind of carriedKinds) {
      if (kind !== null && kind !== carriedKind) {
        continue;
      }
      for (const [name, count] of carrier.carried[carriedKind]) {
        const fits = fit(query, name);
        if (fits > 0) {
          found.push({
            fit: fits,
            entry: {
              kind: carriedKind,
              value: name,
              label: carriedKind === "tera" ? `Tera ${name}` : name,
              detail:
                carriedKind === "tera"
                  ? undefined
                  : kindLabels[carriedKind].toLowerCase(),
              icon: carrier.name,
              count,
              group: `On ${carrier.name}`,
              on: carrier.name,
            },
          });
        }
      }
    }
    return best(found, limit);
  });
};

/** "move:" or "lead:" in front of what is typed asks for that kind only. */
const narrowedTo = (typed: string) => {
  const colon = typed.indexOf(":");
  const prefix = colon > 0 ? typed.slice(0, colon).trim().toLowerCase() : "";
  const kind = (Object.keys(kindLabels) as TokenKind[]).find(
    (candidate) => candidate === prefix,
  );
  return kind ? { kind, text: typed.slice(colon + 1) } : null;
};

/**
 * What a "Team has" input offers: the most used Pokémon while nothing is typed, then everything that
 * fits what is typed. "lead:" or "move:" in front narrows to that kind. `carriers` are the Pokémon the
 * pick's group already asks for: what they carried is offered tied to them.
 */
export const conditionSuggestions = (
  vocabulary: Vocabulary,
  text: string,
  carriers: Carrier[] = [],
): Suggestion[] => {
  const narrowed = narrowedTo(text);
  if (narrowed) {
    return [
      ...tiedSuggestions(carriers, narrowed.kind, narrowed.text, 6),
      ...teamSuggestions(vocabulary, narrowed.kind, narrowed.text, 30),
    ];
  }
  if (toId(text) === "") {
    return teamSuggestions(vocabulary, "pokemon", "", 30);
  }
  return [
    ...teamSuggestions(vocabulary, "pokemon", text, 12),
    ...tiedSuggestions(carriers, null, text, 4),
    ...teamSuggestions(vocabulary, "move", text, 8),
    ...teamSuggestions(vocabulary, "item", text, 6),
    ...teamSuggestions(vocabulary, "ability", text, 4),
    ...teamSuggestions(vocabulary, "tera", text, 3),
    ...teamSuggestions(vocabulary, "lead", text, 3),
  ];
};

const gamesIn = (
  formats: { id: string; games: number }[],
  chosen: string[],
) => {
  let games = 0;
  for (const format of formats) {
    if (chosen.length === 0 || chosen.includes(format.id)) {
      games += format.games;
    }
  }
  return games;
};

/** Players by Smogon name or Alt, those with the most Games in the chosen Formats first. */
export const playerSuggestions = (
  players: Map<string, PlayerEntry> | null,
  text: string,
  formats: string[],
  limit: number,
): Suggestion[] => {
  const query = toId(text);
  const found: { entry: Suggestion; fit: number }[] = [];
  for (const player of players?.values() ?? []) {
    let fits = fit(query, player.name);
    let alt: string | undefined;
    if (fits === 0) {
      alt = player.alts.find((name) => fit(query, name) > 0);
      fits = alt === undefined ? 0 : 1;
    }
    if (fits === 0) {
      continue;
    }
    const others = player.alts.filter(
      (name) => idOf(name) !== idOf(player.name),
    );
    found.push({
      fit: fits,
      entry: {
        kind: "player",
        value: player.key,
        label: player.name,
        detail: alt ? `as ${alt}` : others.slice(0, 3).join(", "),
        count: gamesIn(player.formats, formats) || player.games,
        group: "Players",
      },
    });
  }
  return best(found, limit);
};

/** Tournaments by name, those with the most Games in the chosen Formats first; also those without Games. */
export const tournamentSuggestions = (
  directory: Directory | null,
  text: string,
  formats: string[],
  limit: number,
): Suggestion[] => {
  const query = toId(text);
  const found: { entry: Suggestion; fit: number }[] = [];
  for (const tournament of directory?.tournaments ?? []) {
    const fits = fit(query, tournament.name);
    if (fits > 0) {
      const count = gamesIn(tournament.formats, formats) || tournament.games;
      found.push({
        // a Tournament with Games comes before any without, however well the name fits
        fit: fits + (count > 0 ? 2 : 0),
        entry: {
          kind: "tournament",
          value: tournament.id,
          label: tournament.name,
          detail: tournament.year?.toString(),
          count,
          group: "Tournaments",
        },
      });
    }
  }
  return best(found, limit);
};

/** Formats by name or id, those with the most Games first; without the ones already chosen. */
export const formatSuggestions = (
  directory: Directory | null,
  text: string,
  chosen: string[],
  limit: number,
): Suggestion[] => {
  const query = toId(text);
  const found: { entry: Suggestion; fit: number }[] = [];
  for (const format of directory?.formats ?? []) {
    const fits = Math.max(fit(query, format.name), fit(query, format.id));
    if (fits > 0 && !chosen.includes(format.id)) {
      found.push({
        fit: fits,
        entry: {
          kind: "format",
          value: format.id,
          label: format.name,
          count: format.games,
          group: "Formats",
        },
      });
    }
  }
  return best(found, limit);
};

export interface SearchContext {
  vocabulary: Vocabulary;
  players: Map<string, PlayerEntry> | null;
  directory: Directory | null;
  formats: string[];
  /** The Pokémon each side is already asked to have in every alternative, with what they carried. */
  carriers?: { has: Carrier[]; against: Carrier[] };
}

/** The most words at the end of the text that one pick can stand for ("Mack Knife", "item: Choice Scarf"). */
const longestPick = 4;

/**
 * What the search box on top offers for the words at the end of its text, as many as fit one pick:
 * "LordEnz king" offers Kingambit for "king" and keeps "LordEnz" as text. After "vs" a pick is for the
 * other side, "-" in front leaves it out, "move:" or "lead:" asks for that kind only; a replay link or
 * id offers its Match. What a Pokémon of the filter carried is offered tied to it.
 */
export const searchSuggestions = (
  context: SearchContext,
  typed: string,
): Suggestion[] => {
  const words = splitText(typed);
  const vs = words.findLastIndex((word) => isVs(word));
  const tail = words.slice(vs + 1);
  for (let size = Math.min(tail.length, longestPick); size > 0; size--) {
    const run = tail.slice(tail.length - size);
    let kept = words.slice(0, words.length - size);
    if (size === tail.length && vs !== -1) {
      kept = kept.slice(0, -1);
    }
    const found = suggestionsFor(
      context,
      run.map((word) => bareWord(word)).join(" "),
      vs !== -1,
    );
    if (found.length > 0) {
      const exclude = run[0].startsWith("-") && run[0].length > 1;
      const rest = kept.join(" ");
      return found.map((suggestion) => ({ ...suggestion, exclude, rest }));
    }
  }
  return [];
};

const suggestionsFor = (
  context: SearchContext,
  text: string,
  against: boolean,
): Suggestion[] => {
  if (toId(text) === "") {
    return [];
  }
  const replay = replayIdOf(text);
  if (replay !== null) {
    return [
      {
        kind: "replay",
        value: replay,
        label: `Open the Match of ${replay}`,
        group: "Replay",
      },
    ];
  }
  const { vocabulary, players, directory, formats } = context;
  const onOtherSide = (suggestions: Suggestion[]) =>
    suggestions.map((suggestion) => ({
      ...suggestion,
      against: true,
      group: `${suggestion.group} on the other side`,
    }));
  const carriers = context.carriers?.[against ? "against" : "has"] ?? [];
  const narrowed = narrowedTo(text);
  if (narrowed) {
    const found = [
      ...tiedSuggestions(carriers, narrowed.kind, narrowed.text, 4),
      ...teamSuggestions(vocabulary, narrowed.kind, narrowed.text, 12),
    ];
    return against ? onOtherSide(found) : found;
  }
  const pokemon = [
    ...teamSuggestions(vocabulary, "pokemon", text, 6),
    ...tiedSuggestions(carriers, null, text, 3),
  ];
  const carried = [
    ...teamSuggestions(vocabulary, "move", text, 4),
    ...teamSuggestions(vocabulary, "item", text, 3),
    ...teamSuggestions(vocabulary, "ability", text, 2),
    ...teamSuggestions(vocabulary, "tera", text, 2),
  ];
  if (against) {
    return onOtherSide([...pokemon, ...carried]);
  }
  return [
    ...pokemon,
    ...playerSuggestions(players, text, formats, 4),
    ...tournamentSuggestions(directory, text, formats, 4),
    ...carried,
    ...formatSuggestions(directory, text, formats, 4),
  ];
};
