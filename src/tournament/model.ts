/**
 * The files of Matches/ decoded into the objects the page works with: Tournaments and their threads,
 * Players, and Matches with their Games and Teams. The page only shows what the collector derived;
 * where the collector could not tell which side of a Game a Player played, the Game stays unattributed.
 */
import type {
  FormatEntry,
  IndexFile,
  MatchesFile,
  PlayersFile,
  PokemonRow,
  TournamentsFile,
} from "./files";

export const toId = (text: string | null | undefined) =>
  (text ?? "").toLowerCase().replaceAll(/[^\da-z]/g, "");

// ---------------------------------------------------------------- Tournaments

export interface Thread {
  id: number;
  round: string;
  day: number;
  matches: number;
  matchesWithGames: number;
  tournament: Tournament;
}

export interface Tournament {
  id: string;
  name: string;
  category: string;
  year: number | null;
  forum: string | null;
  games: number;
  formats: { id: string; games: number }[];
  threads: Thread[];
  firstDay: number;
  lastDay: number;
  matches: number;
  matchesWithGames: number;
}

/** index.json and tournaments.json: what exists, before any Match is loaded. */
export interface Directory {
  generated: string;
  formats: FormatEntry[];
  formatsById: Map<string, FormatEntry>;
  categories: string[];
  tournaments: Tournament[];
  tournamentsById: Map<string, Tournament>;
  threads: Map<number, Thread>;
}

export const buildDirectory = (
  index: IndexFile,
  file: TournamentsFile,
): Directory => {
  const threads = new Map<number, Thread>();
  const tournaments = file.tournaments.map((entry) => {
    const tournament: Tournament = {
      id: entry.id,
      name: entry.name,
      category: file.categories[entry.category] ?? "Other",
      year: entry.year,
      forum: entry.forum,
      games: entry.games,
      formats: entry.formats.map(([format, games]) => ({
        id: file.formats[format],
        games,
      })),
      threads: [],
      firstDay: -1,
      lastDay: -1,
      matches: 0,
      matchesWithGames: 0,
    };
    for (const [id, round, day, matches, matchesWithGames] of entry.threads) {
      const thread = { id, round, day, matches, matchesWithGames, tournament };
      tournament.threads.push(thread);
      threads.set(id, thread);
      tournament.matches += matches;
      tournament.matchesWithGames += matchesWithGames;
      if (day >= 0) {
        tournament.firstDay =
          tournament.firstDay < 0 ? day : Math.min(tournament.firstDay, day);
        tournament.lastDay = Math.max(tournament.lastDay, day);
      }
    }
    return tournament;
  });
  return {
    generated: index.generated,
    formats: index.formats,
    formatsById: new Map(index.formats.map((format) => [format.id, format])),
    categories: file.categories,
    tournaments,
    tournamentsById: new Map(
      tournaments.map((tournament) => [tournament.id, tournament]),
    ),
    threads,
  };
};

/** "[Gen 9] OU" for gen9ou; the id itself for a Format the index does not know. */
export const formatName = (directory: Directory | null, id: string) =>
  directory?.formatsById.get(id)?.name ?? id;

/** "G9 OU": the short form for narrow places. */
export const shortFormatName = (directory: Directory | null, id: string) =>
  formatName(directory, id).replace("[Gen ", "G").replace("] ", " ");

// ---------------------------------------------------------------- Players

export interface Player {
  key: string;
  name: string;
}

/** A Player of players.json: with the Alts seen for them and the Formats they have Games in. */
export interface PlayerEntry extends Player {
  alts: string[];
  formats: { id: string; games: number }[];
  games: number;
}

export const buildPlayers = (file: PlayersFile): Map<string, PlayerEntry> => {
  const players = new Map<string, PlayerEntry>();
  for (const [key, name, alts, formats] of file.players) {
    const entries = formats.map(([format, games]) => ({
      id: file.formats[format],
      games,
    }));
    let games = 0;
    for (const entry of entries) {
      games += entry.games;
    }
    players.set(key, { key, name, alts, formats: entries, games });
  }
  return players;
};

// ---------------------------------------------------------------- Teams

export type TokenKind =
  | "pokemon"
  | "move"
  | "item"
  | "ability"
  | "tera"
  | "lead";

/**
 * What a Team is searched by: "move:earthquake" for a move anywhere on the Team,
 * "move:earthquake@garchomp" for the move on that Pokémon.
 */
export const token = (kind: TokenKind, name: string, on?: string | null) =>
  on ? `${kind}:${toId(name)}@${toId(on)}` : `${kind}:${toId(name)}`;

export interface Pokemon {
  name: string;
  /** Item, ability and Tera type as the scouter wrote them: "Leftovers | Black Sludge" when it saw both. */
  item: string | null;
  ability: string | null;
  tera: string | null;
  moves: string[];
  lead: boolean;
  otherNames: string[];
}

export interface Team {
  pokemon: Pokemon[];
  tokens: Set<string>;
  signature: string;
}

/** What the scouter saw in one slot of a Set: usually one value, several when it differed between Games. */
export const alternatives = (value: string | null): string[] =>
  value ? [...new Set(value.split(" | "))] : [];

export const buildTeam = (pokemon: Pokemon[]): Team => {
  const tokens = new Set<string>();
  const add = (kind: TokenKind, name: string, on: string) => {
    tokens.add(token(kind, name));
    tokens.add(token(kind, name, on));
  };
  for (const mon of pokemon) {
    tokens.add(token("pokemon", mon.name));
    if (mon.lead) {
      tokens.add(token("lead", mon.name));
    }
    for (const item of alternatives(mon.item)) {
      add("item", item, mon.name);
    }
    for (const ability of alternatives(mon.ability)) {
      add("ability", ability, mon.name);
    }
    for (const tera of alternatives(mon.tera)) {
      add("tera", tera, mon.name);
    }
    for (const move of mon.moves) {
      add("move", move, mon.name);
    }
  }
  const signature = pokemon
    .map((mon) =>
      [
        mon.name,
        mon.item,
        mon.ability,
        mon.tera,
        mon.moves.join(","),
        mon.lead ? 1 : 0,
      ].join("~"),
    )
    .join("|");
  return { pokemon, tokens, signature };
};

// ---------------------------------------------------------------- Matches and Games

/** One of the two sides of a Game, as the replay shows it. */
export interface GameSide {
  alt: string;
  /** null when the scouter found no valid Team for this side. */
  team: Team | null;
  won: boolean;
  /** The Player who played this side; null when the collector could not tell. */
  player: Player | null;
  game: Game;
  opponent: GameSide;
}

export interface Game {
  /** The replay id, with the password of a private replay. */
  id: string;
  format: string;
  /** Upload time of the replay in Unix seconds. */
  time: number;
  /** False when the replay names no winner. */
  decided: boolean;
  /** False when the collector could not tell which Player played which side. */
  attributed: boolean;
  views: number;
  rating: number;
  sides: [GameSide, GameSide];
  /** The side of the Match's left Player; for a Game that is not attributed, the replay's first side. */
  left: GameSide;
  right: GameSide;
  match: Match;
}

/** One of the two Players of a Match, with what their attributed Games show. */
export interface MatchSide {
  /** null when the thread names only one Player. */
  player: Player | null;
  alts: string[];
  teams: Team[];
  wins: number;
}

export interface Match {
  /** Stable across files: a Game belongs to exactly one Match. */
  key: string;
  threadId: number;
  thread: Thread | null;
  day: number;
  /** The winner, if there is one: by the thread, else by the Games. */
  left: MatchSide;
  right: MatchSide;
  games: Game[];
  formats: string[];
  /** The thread names a winner, or the Games have one. */
  decided: boolean;
  /** The thread names one Player as the winner and the replays show the other ahead. */
  flagged: boolean;
}

/** Shared by all files decoded during a visit, so that a Match or Team found in two files is one object. */
export interface Pool {
  players: Map<string, Player>;
  teams: Map<string, Team>;
  matches: Map<string, Match>;
}

export const createPool = (): Pool => ({
  players: new Map(),
  teams: new Map(),
  matches: new Map(),
});

const nameAt = (table: string[], index: number) =>
  index >= 0 ? (table[index] ?? null) : null;

const decodeTeam = (rows: PokemonRow[], file: MatchesFile) =>
  buildTeam(
    rows.map((row) => ({
      name: file.species[row[0]] ?? "",
      item: nameAt(file.items, row[1]),
      ability: nameAt(file.abilities, row[2]),
      tera: nameAt(file.teras, row[3]),
      moves: row[4].map((move) => file.moves[move]),
      lead: row[5] === 1,
      otherNames: (row[6] ?? []).map((other) => file.species[other]),
    })),
  );

const pushNew = <T>(list: T[], value: T) => {
  if (!list.includes(value)) {
    list.push(value);
  }
};

/**
 * The Matches of a Format file or a Tournament file. A Match that an earlier file of the same pool held
 * comes back as that same object.
 */
export const decodeMatches = (
  file: MatchesFile,
  directory: Directory | null,
  pool: Pool,
): Match[] => {
  const players = file.players.map(([key, name]) => {
    let player = pool.players.get(key);
    if (!player) {
      player = { key, name };
      pool.players.set(key, player);
    }
    return player;
  });
  const decoded: (Team | undefined)[] = Array.from({
    length: file.teams.length,
  });
  const teamOf = (threadId: number, index: number) => {
    if (index < 0 || index >= file.teams.length) {
      return null;
    }
    const team = (decoded[index] ??= decodeTeam(file.teams[index], file));
    const key = `${threadId}|${team.signature}`;
    const known = pool.teams.get(key);
    if (known) {
      return known;
    }
    pool.teams.set(key, team);
    return team;
  };

  const matches: Match[] = [];
  for (const row of file.matches) {
    const [threadId, a, b, threadWinner, matchDay, gameIndices] = row;
    if (gameIndices.length === 0) {
      continue;
    }
    const key = `${threadId}:${file.games[gameIndices[0]][0]}`;
    const known = pool.matches.get(key);
    if (known) {
      matches.push(known);
      continue;
    }
    const thread = directory?.threads.get(threadId) ?? null;
    const sideA: MatchSide = {
      player: a >= 0 ? players[a] : null,
      alts: [],
      teams: [],
      wins: 0,
    };
    const sideB: MatchSide = {
      player: b >= 0 ? players[b] : null,
      alts: [],
      teams: [],
      wins: 0,
    };
    const match = {
      key,
      threadId,
      thread,
      games: [] as Game[],
      formats: [] as string[],
    } as Match;
    const sidesOfA: (0 | 1 | 2)[] = [];
    for (const gameIndex of gameIndices) {
      const [
        id,
        format,
        time,
        alt1,
        alt2,
        winner,
        team1,
        team2,
        sideOfA,
        views,
        rating,
      ] = file.games[gameIndex];
      const attributed = sideOfA === 1 || sideOfA === 2;
      const game = {
        id,
        format: file.formats[format],
        time,
        decided: winner === 1 || winner === 2,
        attributed,
        views,
        rating,
        match,
      } as Game;
      const first = {
        alt: alt1,
        team: teamOf(threadId, team1),
        won: winner === 1,
        player: null,
        game,
      } as GameSide;
      const second = {
        alt: alt2,
        team: teamOf(threadId, team2),
        won: winner === 2,
        player: null,
        game,
      } as GameSide;
      first.opponent = second;
      second.opponent = first;
      game.sides = [first, second];
      if (attributed) {
        const [ofA, ofB] = sideOfA === 1 ? [first, second] : [second, first];
        for (const [side, matchSide] of [
          [ofA, sideA],
          [ofB, sideB],
        ] as const) {
          side.player = matchSide.player;
          if (side.alt) {
            pushNew(matchSide.alts, side.alt);
          }
          if (side.team) {
            pushNew(matchSide.teams, side.team);
          }
          if (side.won) {
            matchSide.wins++;
          }
        }
      }
      sidesOfA.push(attributed ? sideOfA : 0);
      match.games.push(game);
      pushNew(match.formats, game.format);
    }

    let ahead = 0;
    if (sideA.wins !== sideB.wins) {
      ahead = sideA.wins > sideB.wins ? 1 : 2;
    }
    const named = threadWinner === 1 || threadWinner === 2 ? threadWinner : 0;
    const winner = named || ahead;
    const leftIsA = winner !== 2;
    match.left = leftIsA ? sideA : sideB;
    match.right = leftIsA ? sideB : sideA;
    match.decided = winner !== 0;
    match.flagged = named !== 0 && ahead !== 0 && ahead !== named;
    for (const [index, game] of match.games.entries()) {
      const firstIsLeft =
        sidesOfA[index] === 0 || (sidesOfA[index] === 1) === leftIsA;
      game.left = firstIsLeft ? game.sides[0] : game.sides[1];
      game.right = firstIsLeft ? game.sides[1] : game.sides[0];
    }
    if (matchDay >= 0) {
      match.day = matchDay;
    } else if (thread && thread.day >= 0) {
      match.day = thread.day;
    } else {
      match.day = Math.floor(match.games[0].time / 86_400);
    }
    pool.matches.set(key, match);
    matches.push(match);
  }
  return matches;
};

// ---------------------------------------------------------------- small helpers

export const yearOfDay = (day: number) =>
  new Date(day * 86_400_000).getUTCFullYear();

export const dateOfDay = (day: number) =>
  day >= 0
    ? new Date(day * 86_400_000).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        timeZone: "UTC",
      })
    : "";

/** "2024-03" for a time in Unix seconds. */
export const monthOfTime = (time: number) => {
  const date = new Date(time * 1000);
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
};

export const replayUrl = (replayId: string) =>
  `https://replay.pokemonshowdown.com/${replayId}`;

export const threadUrl = (threadId: number) =>
  `https://www.smogon.com/forums/threads/${threadId}/`;

/** 12,345 */
export const formatCount = (count: number) => count.toLocaleString("en");

/** What a Match's Player is called on the page: the Smogon name, else what the thread left open. */
export const playerName = (side: MatchSide) => side.player?.name ?? "?";
