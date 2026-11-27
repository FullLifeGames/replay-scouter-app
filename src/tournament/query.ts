/**
 * The search: which Matches, Games and sides fit a filter. A Format belongs to the Game, so a Match
 * across Formats is found through any of its Games, while only the Games in the chosen Formats count.
 */
import {
  bareWord,
  isVs,
  kindLabels,
  splitText,
  type Conditions,
  type Filter,
  type SortKey,
} from "./filter";
import {
  alternatives,
  toId,
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

// ---------------------------------------------------------------- free text

interface Word {
  id: string;
  exclude: boolean;
}

/** The words of a free text: those for the side, and after "vs" those for the other side. */
export interface TextQuery {
  mine: Word[];
  theirs: Word[];
}

const kindPrefixes = Object.keys(kindLabels).map((kind) => `${kind}:`);

/** "move:" in front of a word is for the suggestions; the text searches the word everywhere. */
const withoutKind = (word: string) => {
  const lower = word.toLowerCase();
  const prefix = kindPrefixes.find((entry) => lower.startsWith(entry));
  return prefix ? word.slice(prefix.length) : word;
};

export const parseText = (text: string): TextQuery => {
  const query: TextQuery = { mine: [], theirs: [] };
  let words = query.mine;
  for (const raw of splitText(text)) {
    if (isVs(raw)) {
      words = query.theirs;
      continue;
    }
    const exclude = raw.startsWith("-") && raw.length > 1;
    const id = toId(withoutKind(bareWord(raw)));
    if (id !== "") {
      words.push({ id, exclude });
    }
  }
  return query;
};

/** Ids joined by "|", which no id holds: a word is found inside one name, never across two. */
const joined = (names: (string | null | undefined)[]) =>
  `|${names.map((name) => toId(name ?? "")).join("|")}|`;

const matchTexts = new WeakMap<Match, string>();
const matchText = (match: Match) => {
  let text = matchTexts.get(match);
  if (text === undefined) {
    const thread = match.thread;
    text = joined([
      thread?.tournament.name,
      thread?.tournament.year?.toString(),
      thread?.round,
    ]);
    matchTexts.set(match, text);
  }
  return text;
};

const teamTexts = new WeakMap<Team, string>();
const teamText = (team: Team | null) => {
  if (team === null) {
    return "";
  }
  let text = teamTexts.get(team);
  if (text === undefined) {
    text = joined(
      team.pokemon.flatMap((mon) => [
        mon.name,
        ...mon.otherNames,
        ...alternatives(mon.item),
        ...alternatives(mon.ability),
        ...alternatives(mon.tera),
        ...mon.moves,
      ]),
    );
    teamTexts.set(team, text);
  }
  return text;
};

const sideText = (side: GameSide) =>
  joined([side.alt, side.player?.name, side.player?.key]) + teamText(side.team);

/**
 * A side meets the text when it, its Game, Match or Tournament shows every word for the side and none
 * it leaves out, and the other side shows every word after "vs" and none it leaves out there.
 */
const meetsText = (side: GameSide, query: TextQuery) => {
  if (query.mine.length > 0) {
    const own = matchText(side.game.match) + side.game.format + sideText(side);
    if (query.mine.some((word) => own.includes(word.id) === word.exclude)) {
      return false;
    }
  }
  if (query.theirs.length > 0) {
    const other = sideText(side.opponent);
    if (query.theirs.some((word) => other.includes(word.id) === word.exclude)) {
      return false;
    }
  }
  return true;
};

// ---------------------------------------------------------------- search

const involves = (match: Match, player: string) =>
  match.left.player?.key === player || match.right.player?.key === player;

export const search = (matches: Match[], filter: Filter): Result => {
  const formats = new Set(filter.formats);
  const has = compile(filter.has);
  const against = compile(filter.against);
  const text = parseText(filter.text);
  const onTeams =
    has.length > 0 ||
    against.length > 0 ||
    text.mine.length > 0 ||
    text.theirs.length > 0;
  const sided = onTeams || filter.player !== null || filter.outcome !== "any";
  const tournaments = new Set(filter.tournaments);

  const matchFits = (match: Match) => {
    if (formats.size > 0 && !match.formats.some((id) => formats.has(id))) {
      return false;
    }
    if (tournaments.size > 0) {
      if (!tournaments.has(match.thread?.tournament.id ?? "")) {
        return false;
      }
      if (filter.round !== null && match.thread?.round !== filter.round) {
        return false;
      }
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
    return (
      meets(side.team, has) &&
      meets(side.opponent.team, against) &&
      meetsText(side, text)
    );
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
