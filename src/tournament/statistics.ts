/**
 * The statistics of a search, counted over its sides: every Game a Team was brought to is one use,
 * as in the Classic view. A share is uses over all sides with a Team; a win rate is wins over the
 * uses in Games that have a winner.
 */
import type { Condition } from "./filter";
import {
  alternatives,
  monthOfTime,
  toId,
  token,
  type GameSide,
  type Pokemon,
  type Team,
  type TokenKind,
} from "./model";

export interface Row {
  /** The entry as text, as the Classic view writes it: "Kingambit", "A / B", "Kingambit: Leftovers". */
  key: string;
  use: number;
  wins: number;
  /** Uses in Games that have a winner. */
  decided: number;
}

export interface Table {
  /** The sides with a Team: what a share is taken of. */
  total: number;
  rows: Row[];
}

export const share = (part: number, whole: number) =>
  whole > 0 ? part / whole : 0;

export const tally = (
  sides: GameSide[],
  keysOf: (team: Team, side: GameSide) => Iterable<string>,
): Table => {
  const rows = new Map<string, Row>();
  let total = 0;
  for (const side of sides) {
    if (side.team === null) {
      continue;
    }
    total++;
    for (const key of new Set(keysOf(side.team, side))) {
      let row = rows.get(key);
      if (!row) {
        row = { key, use: 0, wins: 0, decided: 0 };
        rows.set(key, row);
      }
      row.use++;
      if (side.game.decided) {
        row.decided++;
      }
      if (side.won) {
        row.wins++;
      }
    }
  }
  return {
    total,
    rows: [...rows.values()].sort(
      (a, b) => b.use - a.use || b.wins - a.wins || a.key.localeCompare(b.key),
    ),
  };
};

const named = (team: Team) => team.pokemon.filter((mon) => mon.name !== "");

/** Every way to choose `size` of the entries, in their order. */
const choose = <T>(entries: T[], size: number): T[][] => {
  const result: T[][] = [];
  const pick = (start: number, chosen: T[]) => {
    if (chosen.length === size) {
      result.push(chosen);
      return;
    }
    for (let index = start; index < entries.length; index++) {
      pick(index + 1, [...chosen, entries[index]]);
    }
  };
  pick(0, []);
  return result;
};

/** The Pokémon of a Team in the order a combo lists them: by name, with leads first when leads are marked. */
const comboOrder = (team: Team, leads: boolean) => {
  const seen = new Set<string>();
  const unique = named(team).filter((mon) => {
    if (seen.has(mon.name)) {
      return false;
    }
    seen.add(mon.name);
    return true;
  });
  return unique.sort((a, b) => {
    if (leads && a.lead !== b.lead) {
      return a.lead ? -1 : 1;
    }
    return a.name.localeCompare(b.name);
  });
};

/** A combo is written "A / B"; with leads marked, "(Lead) A / B". */
export const comboSeparator = " / ";
const leadPrefix = "(Lead) ";

/** Teams with more Pokémon than this (merged Teams of formats without a fixed six) are left out of combos. */
const largestTeamForCombos = 12;

export const comboTable = (sides: GameSide[], size: number, leads: boolean) =>
  tally(sides, (team) => {
    const order = comboOrder(team, leads);
    if (order.length < size || order.length > largestTeamForCombos) {
      return [];
    }
    return choose(order, size).map((combo) =>
      combo
        .map((mon) => (leads && mon.lead ? leadPrefix : "") + mon.name)
        .join(comboSeparator),
    );
  });

export interface TableKind {
  id: string;
  /** The tab's name. */
  title: string;
  /** The column label of the text table, as the Classic view writes it. */
  label: string;
  /** The name of the CSV download. */
  file: string;
  /** Whether a row starts with Pokémon icons. */
  icons: boolean;
  /** The Pokémon whose share of the table makes sense to ask for, for the "by Pokémon" tables. */
  byPokemon: boolean;
  keysOf: (team: Team) => string[];
  /** What a Team must have to be counted in the row with this key. */
  conditions: (key: string) => Condition[];
}

const has = (kind: TokenKind, name: string, on?: string): Condition =>
  on ? { kind, name, on, exclude: false } : { kind, name, exclude: false };

const ofPokemon = (
  team: Team,
  values: (mon: Pokemon) => (string | null)[],
): string[] =>
  named(team).flatMap((mon) =>
    values(mon)
      .filter((value) => value !== null && value !== "")
      .map((value) => `${mon.name}: ${value}`),
  );

const splitByPokemon = (key: string) => {
  const colon = key.lastIndexOf(": ");
  return { pokemon: key.slice(0, colon), value: key.slice(colon + 2) };
};

const present = (values: (string | null)[]) =>
  values.filter((value): value is string => value !== null && value !== "");

export const tableKinds: TableKind[] = [
  {
    id: "pokemon",
    title: "Pokémon",
    label: "Pokemon",
    file: "pokemon_statistics.csv",
    icons: true,
    byPokemon: false,
    keysOf: (team) => named(team).map((mon) => mon.name),
    conditions: (key) => [has("pokemon", key)],
  },
  {
    id: "leads",
    title: "Leads",
    label: "Lead",
    file: "lead_statistics.csv",
    icons: true,
    byPokemon: false,
    keysOf: (team) =>
      named(team)
        .filter((mon) => mon.lead)
        .map((mon) => mon.name),
    conditions: (key) => [has("lead", key)],
  },
  {
    id: "items",
    title: "Items",
    label: "Item",
    file: "item_statistics.csv",
    icons: false,
    byPokemon: false,
    keysOf: (team) => team.pokemon.flatMap((mon) => alternatives(mon.item)),
    conditions: (key) => [has("item", key)],
  },
  {
    id: "items-by-pokemon",
    title: "Items by Pokémon",
    label: "Items By Pokémon",
    file: "item_by_pokemon_statistics.csv",
    icons: true,
    byPokemon: true,
    keysOf: (team) => ofPokemon(team, (mon) => alternatives(mon.item)),
    conditions: (key) => {
      const { pokemon, value } = splitByPokemon(key);
      return [has("item", value, pokemon)];
    },
  },
  {
    id: "moves",
    title: "Moves",
    label: "Move",
    file: "move_statistics.csv",
    icons: false,
    byPokemon: false,
    keysOf: (team) => team.pokemon.flatMap((mon) => mon.moves),
    conditions: (key) => [has("move", key)],
  },
  {
    id: "moves-by-pokemon",
    title: "Moves by Pokémon",
    label: "Moves By Pokémon",
    file: "move_by_pokemon_statistics.csv",
    icons: true,
    byPokemon: true,
    keysOf: (team) => ofPokemon(team, (mon) => mon.moves),
    conditions: (key) => {
      const { pokemon, value } = splitByPokemon(key);
      return [has("move", value, pokemon)];
    },
  },
  {
    id: "tera",
    title: "Tera",
    label: "Tera Type",
    file: "tera_statistics.csv",
    icons: false,
    byPokemon: false,
    keysOf: (team) => team.pokemon.flatMap((mon) => alternatives(mon.tera)),
    conditions: (key) => [has("tera", key)],
  },
];

/** The Conditions of a combo row: every Pokémon of it, as a lead where the row marks one. */
export const comboConditions = (key: string): Condition[] =>
  key
    .split(comboSeparator)
    .map((name) =>
      name.startsWith(leadPrefix)
        ? has("lead", name.slice(leadPrefix.length))
        : has("pokemon", name),
    );

/** The Pokémon a row is about, for its icons. */
export const pokemonOfRow = (kind: TableKind | "combos", key: string) => {
  if (kind === "combos") {
    return key
      .split(comboSeparator)
      .map((name) =>
        name.startsWith(leadPrefix) ? name.slice(leadPrefix.length) : name,
      );
  }
  if (!kind.icons) {
    return [];
  }
  return [kind.byPokemon ? splitByPokemon(key).pokemon : key];
};

// ---------------------------------------------------------------- one Pokémon

export interface PokemonDetail {
  use: number;
  wins: number;
  decided: number;
  items: Table;
  teras: Table;
  moves: Table;
  abilities: Table;
  teammates: Table;
  /** The Pokémon on the other side, with how the Teams with this Pokémon did against them. */
  opponents: Table;
}

export const pokemonDetail = (
  name: string,
  sides: GameSide[],
): PokemonDetail => {
  const wanted = token("pokemon", name);
  const mine = sides.filter((side) => side.team?.tokens.has(wanted));
  const pick = (values: (mon: Pokemon) => (string | null)[]) =>
    tally(mine, (team) =>
      present(
        team.pokemon
          .filter((mon) => mon.name === name)
          .flatMap((mon) => values(mon)),
      ),
    );
  const opponents = new Map<string, Row>();
  let wins = 0;
  let decided = 0;
  for (const side of mine) {
    if (side.won) {
      wins++;
    }
    if (side.game.decided) {
      decided++;
    }
    const other = side.opponent.team;
    if (other === null) {
      continue;
    }
    for (const key of new Set(named(other).map((mon) => mon.name))) {
      let row = opponents.get(key);
      if (!row) {
        row = { key, use: 0, wins: 0, decided: 0 };
        opponents.set(key, row);
      }
      row.use++;
      if (side.game.decided) {
        row.decided++;
      }
      if (side.won) {
        row.wins++;
      }
    }
  }
  return {
    use: mine.length,
    wins,
    decided,
    items: pick((mon) => alternatives(mon.item)),
    teras: pick((mon) => alternatives(mon.tera)),
    moves: pick((mon) => mon.moves),
    abilities: pick((mon) => alternatives(mon.ability)),
    teammates: tally(mine, (team) =>
      named(team)
        .filter((mon) => mon.name !== name)
        .map((mon) => mon.name),
    ),
    opponents: {
      total: mine.length,
      rows: [...opponents.values()].sort((a, b) => b.use - a.use),
    },
  };
};

// ---------------------------------------------------------------- usage over time

export interface Timeline {
  /** "2024-03", oldest first. */
  months: string[];
  /** Sides with a Team in each month. */
  totals: number[];
  lines: { label: string; shares: number[] }[];
}

/**
 * The share of sides per month whose Team meets each Condition. Months with fewer than `least` sides
 * are left out: a share of three Teams says nothing.
 */
export const usageOverTime = (
  sides: GameSide[],
  conditions: Condition[],
  labelOf: (condition: Condition) => string,
  least = 10,
): Timeline => {
  const tokens = conditions.map((condition) =>
    token(condition.kind, condition.name, condition.on),
  );
  const months = new Map<string, { total: number; hits: number[] }>();
  for (const side of sides) {
    if (side.team === null || side.game.time <= 0) {
      continue;
    }
    const month = monthOfTime(side.game.time);
    let entry = months.get(month);
    if (!entry) {
      entry = { total: 0, hits: tokens.map(() => 0) };
      months.set(month, entry);
    }
    entry.total++;
    for (const [index, wanted] of tokens.entries()) {
      if (side.team.tokens.has(wanted)) {
        entry.hits[index]++;
      }
    }
  }
  const kept = [...months.entries()]
    .filter(([, entry]) => entry.total >= least)
    .sort(([a], [b]) => a.localeCompare(b));
  return {
    months: kept.map(([month]) => month),
    totals: kept.map(([, entry]) => entry.total),
    lines: conditions.map((condition, index) => ({
      label: labelOf(condition),
      shares: kept.map(([, entry]) => share(entry.hits[index], entry.total)),
    })),
  };
};

// ---------------------------------------------------------------- what a search covers

export interface Coverage {
  games: number;
  matches: number;
  tournaments: number;
  players: number;
  firstDay: number;
  lastDay: number;
}

export const coverage = (sides: GameSide[]): Coverage => {
  const games = new Set<unknown>();
  const matches = new Set<unknown>();
  const tournaments = new Set<unknown>();
  const players = new Set<string>();
  let firstDay = Number.POSITIVE_INFINITY;
  let lastDay = -1;
  for (const side of sides) {
    const match = side.game.match;
    games.add(side.game);
    matches.add(match);
    if (match.thread) {
      tournaments.add(match.thread.tournament);
    }
    if (side.player) {
      players.add(side.player.key);
    }
    firstDay = Math.min(firstDay, match.day);
    lastDay = Math.max(lastDay, match.day);
  }
  return {
    games: games.size,
    matches: matches.size,
    tournaments: tournaments.size,
    players: players.size,
    firstDay: Number.isFinite(firstDay) ? firstDay : -1,
    lastDay,
  };
};

// ---------------------------------------------------------------- what can be searched for

/** How often each Pokémon, move, item, ability, Tera type and lead occurs on the sides, for suggestions. */
export type Vocabulary = Record<TokenKind, Map<string, number>>;

export const vocabularyOf = (sides: GameSide[]): Vocabulary => {
  const vocabulary: Vocabulary = {
    pokemon: new Map(),
    move: new Map(),
    item: new Map(),
    ability: new Map(),
    tera: new Map(),
    lead: new Map(),
  };
  const count = (kind: TokenKind, name: string | null) => {
    if (name) {
      vocabulary[kind].set(name, (vocabulary[kind].get(name) ?? 0) + 1);
    }
  };
  for (const side of sides) {
    if (side.team === null) {
      continue;
    }
    for (const mon of side.team.pokemon) {
      count("pokemon", mon.name);
      for (const item of alternatives(mon.item)) {
        count("item", item);
      }
      for (const ability of alternatives(mon.ability)) {
        count("ability", ability);
      }
      for (const tera of alternatives(mon.tera)) {
        count("tera", tera);
      }
      if (mon.lead) {
        count("lead", mon.name);
      }
      for (const move of mon.moves) {
        count("move", move);
      }
    }
  }
  return vocabulary;
};

/** What a Pokémon carries and a Condition can tie to it: "Stealth Rock on Garchomp". */
export type CarriedKind = Exclude<TokenKind, "pokemon" | "lead">;

/** A Pokémon with how often it carried each move, item, ability and Tera type on the sides. */
export interface Carrier {
  /** The Pokémon's name as the Games write it. */
  name: string;
  carried: Record<CarriedKind, Map<string, number>>;
}

/** What the named Pokémon carried on the sides, in the order they are named; a Pokémon on no side is left out. */
export const carriersOf = (sides: GameSide[], pokemon: string[]): Carrier[] => {
  const ids = [...new Set(pokemon.map((name) => toId(name)))];
  const byId = new Map<string, Carrier>();
  // a name stands on thousands of sides; its id is worked out once
  const byName = new Map<string, Carrier | null>();
  const carrierOf = (name: string) => {
    let carrier = byName.get(name);
    if (carrier === undefined) {
      const id = toId(name);
      carrier = ids.includes(id)
        ? (byId.get(id) ?? {
            name,
            carried: {
              move: new Map(),
              item: new Map(),
              ability: new Map(),
              tera: new Map(),
            },
          })
        : null;
      if (carrier) {
        byId.set(id, carrier);
      }
      byName.set(name, carrier);
    }
    return carrier;
  };
  const count = (counts: Map<string, number>, name: string) =>
    counts.set(name, (counts.get(name) ?? 0) + 1);
  for (const side of sides) {
    for (const mon of side.team?.pokemon ?? []) {
      const carrier = carrierOf(mon.name);
      if (carrier === null) {
        continue;
      }
      for (const item of alternatives(mon.item)) {
        count(carrier.carried.item, item);
      }
      for (const ability of alternatives(mon.ability)) {
        count(carrier.carried.ability, ability);
      }
      for (const tera of alternatives(mon.tera)) {
        count(carrier.carried.tera, tera);
      }
      for (const move of mon.moves) {
        count(carrier.carried.move, move);
      }
    }
  }
  return ids.flatMap((id) => byId.get(id) ?? []);
};
