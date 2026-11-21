/**
 * What the search box and the filter inputs offer while someone types: Pokémon, moves, items,
 * abilities, Tera types and leads of the loaded Games, Players, Tournaments and Formats.
 */
import { kindLabels, replayIdOf } from "./filter";
import {
  toId,
  type Directory,
  type PlayerEntry,
  type TokenKind,
} from "./model";
import type { Vocabulary } from "./statistics";

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
}

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
 * fits what is typed. "lead:" or "move:" in front narrows to that kind.
 */
export const conditionSuggestions = (
  vocabulary: Vocabulary,
  text: string,
): Suggestion[] => {
  const narrowed = narrowedTo(text);
  if (narrowed) {
    return teamSuggestions(vocabulary, narrowed.kind, narrowed.text, 30);
  }
  if (toId(text) === "") {
    return teamSuggestions(vocabulary, "pokemon", "", 30);
  }
  return [
    ...teamSuggestions(vocabulary, "pokemon", text, 12),
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
          detail: [tournament.category, tournament.year]
            .filter((part) => part !== null)
            .join(", "),
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
}

/**
 * What the search box on top offers. "vs " in front puts a pick on the other side, "move:" or "lead:"
 * asks for that kind only; a replay link or id offers its Match.
 */
export const searchSuggestions = (
  context: SearchContext,
  typed: string,
): Suggestion[] => {
  const against = /^vs\s+/i.test(typed);
  const text = typed.replace(/^vs\s+/i, "");
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
  const narrowed = narrowedTo(text);
  if (narrowed) {
    const found = teamSuggestions(vocabulary, narrowed.kind, narrowed.text, 12);
    return against ? onOtherSide(found) : found;
  }
  const onTeams = [
    ...teamSuggestions(vocabulary, "pokemon", text, 6),
    ...teamSuggestions(vocabulary, "move", text, 4),
    ...teamSuggestions(vocabulary, "item", text, 3),
    ...teamSuggestions(vocabulary, "ability", text, 2),
    ...teamSuggestions(vocabulary, "tera", text, 2),
  ];
  if (against) {
    return onOtherSide(onTeams);
  }
  const [pokemon, rest] = [onTeams.slice(0, 6), onTeams.slice(6)];
  const firstOther = pokemon.findIndex(
    (suggestion) => suggestion.kind !== "pokemon",
  );
  const split = firstOther === -1 ? pokemon.length : firstOther;
  return [
    ...onTeams.slice(0, split),
    ...playerSuggestions(players, text, formats, 4),
    ...tournamentSuggestions(directory, text, formats, 4),
    ...onTeams.slice(split, 6),
    ...rest,
    ...formatSuggestions(directory, text, formats, 4),
  ];
};
