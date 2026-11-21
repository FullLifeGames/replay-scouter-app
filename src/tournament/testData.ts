/**
 * A small set of files for the specs: one Team Tournament with two Rounds, one Official with a single
 * thread and one Tournament without Games; Alice, Bob, Carol and Dave.
 */
import type {
  IndexFile,
  MatchesFile,
  PlayersFile,
  TournamentsFile,
} from "./files";
import { buildDirectory, createPool, decodeMatches, type Match } from "./model";

const time = (day: number, seconds = 0) => day * 86_400 + seconds;

export const indexFile: IndexFile = {
  v: 1,
  generated: "2026-11-22T03:12:45Z",
  formats: [
    { id: "gen9ou", name: "[Gen 9] OU", games: 5, matches: 4, lastDay: 20_007 },
    { id: "gen8ou", name: "[Gen 8] OU", games: 1, matches: 1, lastDay: 20_000 },
  ],
};

export const tournamentsFile: TournamentsFile = {
  v: 1,
  categories: ["Official", "Team Tournament", "Other"],
  formats: ["gen9ou", "gen8ou"],
  tournaments: [
    {
      id: "spl-xvi",
      name: "SPL XVI",
      category: 1,
      year: 2024,
      forum: "smogon-premier-league.130",
      games: 5,
      formats: [
        [0, 4],
        [1, 1],
      ],
      threads: [
        [100, "Week 1", 20_000, 3, 1],
        [101, "Week 2", 20_007, 2, 2],
      ],
    },
    {
      id: "ost-xx",
      name: "OST XX",
      category: 0,
      year: 2023,
      forum: null,
      games: 1,
      formats: [[0, 1]],
      threads: [[200, "", 19_400, 1, 1]],
    },
    {
      id: "empty-cup",
      name: "Empty Cup",
      category: 2,
      year: 2022,
      forum: null,
      games: 0,
      formats: [],
      threads: [[300, "Round 1", 19_000, 4, 0]],
    },
  ],
};

export const playersFile: PlayersFile = {
  v: 1,
  formats: ["gen9ou", "gen8ou"],
  players: [
    [
      "alice",
      "Alice",
      ["alice alt", "Alice"],
      [
        [0, 4],
        [1, 1],
      ],
    ],
    [
      "bob",
      "Bob",
      ["Bobby", "bob"],
      [
        [0, 3],
        [1, 1],
      ],
    ],
    ["carol", "Carol", ["Carol"], [[0, 2]]],
    ["dave", "Dave", [], [[0, 1]]],
  ],
};

/**
 * Teams: 0 Alice's (Kingambit, lead Great Tusk), 1 Bob's (Gholdengo, Dragapult), 2 Carol's (lead Garchomp,
 * Kingambit), 3 Alice's Gen 8 Team (Zamazenta, Gholdengo).
 */
export const gen9ouFile: MatchesFile = {
  v: 1,
  formats: ["gen9ou", "gen8ou"],
  players: [
    ["alice", "Alice"],
    ["bob", "Bob"],
    ["carol", "Carol"],
    ["dave", "Dave"],
  ],
  species: [
    "Kingambit",
    "Great Tusk",
    "Gholdengo",
    "Dragapult",
    "Garchomp",
    "Zamazenta",
  ],
  items: ["Leftovers", "Choice Scarf"],
  abilities: ["Supreme Overlord"],
  teras: ["Dark", "Fairy"],
  moves: ["Sucker Punch", "Earthquake", "Shadow Ball", "Stealth Rock"],
  teams: [
    [
      [0, 0, 0, 0, [0], 0],
      [1, -1, -1, -1, [1], 1],
    ],
    [
      [2, 1, -1, -1, [2], 0],
      [3, -1, -1, -1, [], 0],
    ],
    [
      [4, -1, -1, -1, [1, 3], 1],
      [0, -1, -1, 1, [0], 0],
    ],
    [
      [5, -1, -1, -1, [], 0],
      [2, -1, -1, -1, [2], 0],
    ],
  ],
  // prettier-ignore
  games: [
    // Week 1, Alice against Bob: Alice wins Game 1, Bob Game 2 (sides swapped), Alice the Gen 8 Game
    ["gen9ou-1", 0, time(20_000), "alice alt", "Bobby", 1, 0, 1, 1, 100, 1500],
    ["gen9ou-2", 0, time(20_000, 600), "Bobby", "alice alt", 1, 1, 0, 2, 50, 0],
    ["gen8ou-3", 1, time(20_000, 1200), "alice alt", "Bobby", 1, 3, -1, 1, 10, 0],
    // Week 2, Carol against Dave: the collector could not tell the sides
    ["gen9ou-4", 0, time(20_007), "carol", "xX_who_Xx", 2, 2, 1, 0, 5, 0],
    // Week 2, Carol against Alice: the replay has Carol winning, the thread Alice
    ["gen9ou-5", 0, time(20_007, 100), "Carol", "Alice", 1, 2, 0, 1, 7, 1700],
    // OST, Alice against Bob: the replay names no winner
    ["gen9ou-6", 0, time(19_400), "alice alt", "bob", 0, 0, 1, 1, 1, 0],
  ],
  matches: [
    [100, 0, 1, 1, 20_000, [0, 1, 2]],
    [101, 2, 3, 0, 20_007, [3]],
    [101, 2, 0, 2, 20_007, [4]],
    [200, 0, 1, 0, -1, [5]],
  ],
};

/** The Gen 8 file holds the one Match with a Gen 8 Game, whole, with its tables in another order. */
export const gen8ouFile: MatchesFile = {
  v: 1,
  formats: ["gen8ou", "gen9ou"],
  players: [
    ["bob", "Bob"],
    ["alice", "Alice"],
  ],
  species: ["Zamazenta", "Gholdengo", "Dragapult", "Great Tusk", "Kingambit"],
  items: ["Choice Scarf", "Leftovers"],
  abilities: ["Supreme Overlord"],
  teras: ["Dark"],
  moves: ["Shadow Ball", "Earthquake", "Sucker Punch"],
  teams: [
    [
      [0, -1, -1, -1, [], 0],
      [1, -1, -1, -1, [0], 0],
    ],
    [
      [1, 0, -1, -1, [0], 0],
      [2, -1, -1, -1, [], 0],
    ],
    [
      [4, 1, 0, 0, [2], 0],
      [3, -1, -1, -1, [1], 1],
    ],
  ],
  // prettier-ignore
  games: [
    ["gen9ou-1", 1, time(20_000), "alice alt", "Bobby", 1, 2, 1, 1, 100, 1500],
    ["gen9ou-2", 1, time(20_000, 600), "Bobby", "alice alt", 1, 1, 2, 2, 50, 0],
    ["gen8ou-3", 0, time(20_000, 1200), "alice alt", "Bobby", 1, 0, -1, 1, 10, 0],
  ],
  matches: [[100, 1, 0, 1, 20_000, [0, 1, 2]]],
};

export const directory = buildDirectory(indexFile, tournamentsFile);

/** The Matches of the Gen 9 file: Week 1, the two of Week 2, OST. */
export const decoded = (): Match[] =>
  decodeMatches(gen9ouFile, directory, createPool());

export const formatNames = (id: string) =>
  directory.formatsById.get(id)?.name ?? id;
