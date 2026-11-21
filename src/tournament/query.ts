/**
 * The search: which Matches, Games and sides fit a filter. A Format belongs to the Game, so a Match
 * across Formats is found through any of its Games, while only the Games in the chosen Formats count.
 */
import type { Conditions, Filter, SortKey } from "./filter";
import {
  token,
  yearOfDay,
  type Game,
  type GameSide,
  type Match,
  type Team,
} from "./model";

export interface Result {
  matches: Match[];
  /** The Games of those Matches that fit, in the chosen Formats. */
  games: Game[];
  /**
   * The sides the Teams and Stats tabs are about: the sides that fit a filter on the Team, the outcome or
   * the Player, else both sides of every Game.
   */
  sides: GameSide[];
}

type Compiled = { token: string; exclude: boolean }[][];

const compile = (conditions: Conditions): Compiled =>
  conditions
    .filter((group) => group.length > 0)
    .map((group) =>
      group.map((condition) => ({
        token: token(condition.kind, condition.name, condition.on),
        exclude: condition.exclude,
      })),
    );

/** A side without a Team meets only Conditions that exclude. */
const meets = (team: Team | null, conditions: Compiled) =>
  conditions.length === 0 ||
  conditions.some((group) =>
    group.every(
      (condition) =>
        (team !== null && team.tokens.has(condition.token)) !==
        condition.exclude,
    ),
  );

const involves = (match: Match, player: string) =>
  match.left.player?.key === player || match.right.player?.key === player;

export const search = (matches: Match[], filter: Filter): Result => {
  const formats = new Set(filter.formats);
  const has = compile(filter.has);
  const against = compile(filter.against);
  const onTeams = has.length > 0 || against.length > 0;
  const sided = onTeams || filter.player !== null || filter.outcome !== "any";
  const categories = new Set(filter.categories);

  const matchFits = (match: Match) => {
    if (formats.size > 0 && !match.formats.some((id) => formats.has(id))) {
      return false;
    }
    if (filter.tournament !== null) {
      if (match.thread?.tournament.id !== filter.tournament) {
        return false;
      }
      if (filter.round !== null && match.thread.round !== filter.round) {
        return false;
      }
    }
    if (
      categories.size > 0 &&
      !categories.has(match.thread?.tournament.category ?? "")
    ) {
      return false;
    }
    if (filter.fromYear !== null || filter.toYear !== null) {
      const year = yearOfDay(match.day);
      if (filter.fromYear !== null && year < filter.fromYear) {
        return false;
      }
      if (filter.toYear !== null && year > filter.toYear) {
        return false;
      }
    }
    return filter.player === null || involves(match, filter.player);
  };

  const sideFits = (side: GameSide) => {
    if (filter.outcome === "won" && !side.won) {
      return false;
    }
    if (filter.outcome === "lost" && !side.opponent.won) {
      return false;
    }
    if (filter.player !== null && side.player?.key !== filter.player) {
      return false;
    }
    return meets(side.team, has) && meets(side.opponent.team, against);
  };

  const result: Result = { matches: [], games: [], sides: [] };
  for (const match of matches) {
    if (!matchFits(match)) {
      continue;
    }
    let found = false;
    for (const game of match.games) {
      if (formats.size > 0 && !formats.has(game.format)) {
        continue;
      }
      const fitting = sided
        ? game.sides.filter((side) => sideFits(side))
        : game.sides;
      // The Player played this Game, but the collector could not tell on which side: the Game
      // counts, neither Team does.
      const unattributed =
        filter.player !== null &&
        !game.attributed &&
        !onTeams &&
        filter.outcome === "any";
      if (fitting.length === 0 && !unattributed) {
        continue;
      }
      found = true;
      result.games.push(game);
      for (const side of fitting) {
        result.sides.push(side);
      }
    }
    if (found) {
      result.matches.push(match);
    }
  }
  return result;
};

// ---------------------------------------------------------------- order

const lastTime = (games: Game[]) => {
  let time = 0;
  for (const game of games) {
    time = Math.max(time, game.time);
  }
  return time;
};

const highest = (games: Game[], value: (game: Game) => number) => {
  let result = 0;
  for (const game of games) {
    result = Math.max(result, value(game));
  }
  return result;
};

const total = (games: Game[], value: (game: Game) => number) => {
  let result = 0;
  for (const game of games) {
    result += value(game);
  }
  return result;
};

const byText = (a: string, b: string) =>
  a.localeCompare(b, "en", { sensitivity: "base" });

/** What a list is sorted by, read from one of its entries; the newest entry comes first among equals. */
interface Sortable {
  day: number;
  time: number;
  format: string;
  player: string;
  games: number;
  rating: number;
  views: number;
}

const compare = (key: SortKey, a: Sortable, b: Sortable) => {
  switch (key) {
    case "format": {
      return byText(a.format, b.format);
    }
    case "player": {
      return byText(a.player, b.player);
    }
    case "games": {
      return b.games - a.games;
    }
    case "rating": {
      return b.rating - a.rating;
    }
    case "views": {
      return b.views - a.views;
    }
    default: {
      return 0;
    }
  }
};

const sorted = <T>(
  entries: T[],
  describe: (entry: T) => Sortable,
  key: SortKey,
  reversed: boolean,
): T[] => {
  const direction = reversed ? -1 : 1;
  return entries
    .map((entry) => ({ entry, sortable: describe(entry) }))
    .sort((a, b) => {
      const byKey = compare(key, a.sortable, b.sortable);
      if (byKey !== 0) {
        return direction * byKey;
      }
      const byDate =
        b.sortable.day - a.sortable.day || b.sortable.time - a.sortable.time;
      return key === "date" ? direction * byDate : byDate;
    })
    .map((item) => item.entry);
};

/** The Games of a Match that are in the chosen Formats; all of them when none is chosen. */
export const gamesInFormats = (match: Match, formats: string[]) =>
  formats.length === 0
    ? match.games
    : match.games.filter((game) => formats.includes(game.format));

export const sortMatches = (
  matches: Match[],
  key: SortKey,
  reversed: boolean,
  formats: string[],
  formatName: (id: string) => string,
): Match[] =>
  sorted(
    matches,
    (match) => {
      const games = gamesInFormats(match, formats);
      return {
        day: match.day,
        time: lastTime(match.games),
        format: formatName((games[0] ?? match.games[0]).format),
        player: match.left.player?.name ?? match.games[0].left.alt,
        games: games.length,
        rating: highest(games, (game) => game.rating),
        views: total(games, (game) => game.views),
      };
    },
    key,
    reversed,
  );

// ---------------------------------------------------------------- Teams of a search

/** A Team with the sides of the search that brought it. */
export interface TeamUse {
  team: Team;
  sides: GameSide[];
}

export const teamsOf = (sides: GameSide[]): TeamUse[] => {
  const uses = new Map<Team, TeamUse>();
  for (const side of sides) {
    if (side.team === null) {
      continue;
    }
    let use = uses.get(side.team);
    if (!use) {
      use = { team: side.team, sides: [] };
      uses.set(side.team, use);
    }
    use.sides.push(side);
  }
  return [...uses.values()];
};

export const sortTeams = (
  teams: TeamUse[],
  key: SortKey,
  reversed: boolean,
  formatName: (id: string) => string,
): TeamUse[] =>
  sorted(
    teams,
    (use) => {
      const games = use.sides.map((side) => side.game);
      return {
        day: games[0].match.day,
        time: lastTime(games),
        format: formatName(games[0].format),
        player: use.sides[0].player?.name ?? use.sides[0].alt,
        games: games.length,
        rating: highest(games, (game) => game.rating),
        views: total(games, (game) => game.views),
      };
    },
    key,
    reversed,
  );
