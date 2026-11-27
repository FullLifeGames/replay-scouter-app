import { emptyFilter } from "./filter";
import { buildPlayers } from "./model";
import { search } from "./query";
import { carriersOf, vocabularyOf } from "./statistics";
import {
  conditionOf,
  conditionSuggestions,
  formatSuggestions,
  playerSuggestions,
  searchSuggestions,
  tournamentSuggestions,
  type SearchContext,
} from "./suggestions";
import { decoded, directory, playersFile } from "./testData";

const sides = search(decoded(), emptyFilter()).sides;
const vocabulary = vocabularyOf(sides);
const carriers = (...pokemon: string[]) => carriersOf(sides, pokemon);
const players = buildPlayers(playersFile);
const context: SearchContext = { vocabulary, players, directory, formats: [] };

const labels = (suggestions: { label: string }[]) =>
  suggestions.map((suggestion) => suggestion.label);

describe("suggestions for a Team", () => {
  it("offers the most used Pokémon before anything is typed", () => {
    const offered = conditionSuggestions(vocabulary, "");
    expect(offered[0]).toMatchObject({
      kind: "pokemon",
      value: "Kingambit",
      icon: "Kingambit",
      count: 6,
    });
    expect(offered.every((entry) => entry.kind === "pokemon")).toBe(true);
  });

  it("offers Pokémon, moves, items, abilities, Tera types and leads that fit", () => {
    expect(labels(conditionSuggestions(vocabulary, "ga"))).toEqual([
      "Garchomp",
      "Kingambit",
      "Dragapult",
      "Garchomp",
    ]);
    expect(conditionSuggestions(vocabulary, "ga").at(-1)).toMatchObject({
      kind: "lead",
      detail: "as lead",
    });
    expect(conditionSuggestions(vocabulary, "stealth")[0]).toMatchObject({
      kind: "move",
      value: "Stealth Rock",
      group: "Moves",
    });
    expect(conditionSuggestions(vocabulary, "fairy")[0]).toMatchObject({
      kind: "tera",
      value: "Fairy",
      label: "Tera Fairy",
    });
  });

  it("narrows to a kind named in front", () => {
    expect(labels(conditionSuggestions(vocabulary, "lead:"))).toEqual([
      "Great Tusk",
      "Garchomp",
    ]);
    expect(labels(conditionSuggestions(vocabulary, "item: scarf"))).toEqual([
      "Choice Scarf",
    ]);
  });
});

describe("what a Pokémon of the Team carried", () => {
  it("offers a move tied to the Pokémon before the move on any Pokémon", () => {
    const offered = conditionSuggestions(
      vocabulary,
      "stealth",
      carriers("Garchomp"),
    );
    expect(offered).toHaveLength(2);
    expect(offered[0]).toEqual({
      kind: "move",
      value: "Stealth Rock",
      label: "Stealth Rock",
      detail: "move",
      icon: "Garchomp",
      count: 2,
      group: "On Garchomp",
      on: "Garchomp",
    });
    expect(offered[1]).toMatchObject({ value: "Stealth Rock", group: "Moves" });
    expect(conditionOf(offered[0], true)).toEqual({
      kind: "move",
      name: "Stealth Rock",
      on: "Garchomp",
      exclude: true,
    });
    expect(conditionOf(offered[1], false)).toEqual({
      kind: "move",
      name: "Stealth Rock",
      exclude: false,
    });
  });

  it("offers only what that Pokémon carried", () => {
    const offered = conditionSuggestions(
      vocabulary,
      "stealth",
      carriers("Kingambit"),
    );
    expect(offered.map((entry) => entry.on)).toEqual([undefined]);
  });

  it("offers it for each Pokémon, after the Pokémon that fit", () => {
    const offered = conditionSuggestions(
      vocabulary,
      "ea",
      carriers("Great Tusk", "Garchomp"),
    );
    // "ea" is in Great Tusk, Earthquake and Stealth Rock
    expect(offered.map((entry) => `${entry.group}: ${entry.label}`)).toEqual([
      "Pokémon: Great Tusk",
      "On Great Tusk: Earthquake",
      "On Garchomp: Earthquake",
      "On Garchomp: Stealth Rock",
      "Moves: Earthquake",
      "Moves: Stealth Rock",
      "Leads: Great Tusk",
    ]);
    expect(offered[1].count).toBe(4);
    expect(offered[2].count).toBe(2);
  });

  it("offers nothing tied before something is typed", () => {
    const offered = conditionSuggestions(vocabulary, "", carriers("Kingambit"));
    expect(offered.every((entry) => entry.on === undefined)).toBe(true);
  });

  it("offers the most carried of a kind after 'tera:'", () => {
    const offered = conditionSuggestions(
      vocabulary,
      "tera:",
      carriers("Kingambit"),
    );
    expect(offered.slice(0, 3)).toMatchObject([
      { label: "Tera Dark", on: "Kingambit", count: 4 },
      { label: "Tera Fairy", on: "Kingambit", count: 2 },
      { label: "Tera Dark", group: "Tera types" },
    ]);
    expect(offered[0].detail).toBeUndefined();
    expect(
      conditionSuggestions(vocabulary, "lead:", carriers("Kingambit")).some(
        (entry) => entry.on !== undefined,
      ),
    ).toBe(false);
  });
});

describe("suggestions for Players, Tournaments and Formats", () => {
  it("finds a Player by Smogon name or by Alt", () => {
    expect(playerSuggestions(players, "ali", [], 5)[0]).toMatchObject({
      value: "alice",
      label: "Alice",
      detail: "alice alt",
      count: 5,
    });
    expect(playerSuggestions(players, "bobby", [], 5)[0]).toMatchObject({
      value: "bob",
      detail: "as Bobby",
    });
    expect(playerSuggestions(players, "alice", ["gen8ou"], 5)[0].count).toBe(1);
    expect(playerSuggestions(null, "alice", [], 5)).toEqual([]);
  });

  it("finds Tournaments, also those without Games", () => {
    expect(tournamentSuggestions(directory, "spl", [], 5)[0]).toMatchObject({
      value: "spl-xvi",
      detail: "2024",
      count: 5,
    });
    expect(labels(tournamentSuggestions(directory, "cup", [], 5))).toEqual([
      "Empty Cup",
    ]);
  });

  it("finds Formats by name or id, without the chosen ones", () => {
    expect(labels(formatSuggestions(directory, "gen 9", [], 5))).toEqual([
      "[Gen 9] OU",
    ]);
    expect(labels(formatSuggestions(directory, "ou", ["gen9ou"], 5))).toEqual([
      "[Gen 8] OU",
    ]);
  });
});

describe("the search box", () => {
  it("offers nothing for an empty box", () => {
    expect(searchSuggestions(context, "  ")).toEqual([]);
  });

  it("mixes Pokémon, Players, Tournaments and Formats", () => {
    const kinds = searchSuggestions(context, "al").map((entry) => entry.kind);
    expect(kinds).toContain("player");
    expect(searchSuggestions(context, "kinga")[0]).toMatchObject({
      kind: "pokemon",
      value: "Kingambit",
    });
    expect(
      searchSuggestions(context, "ou").map((entry) => entry.kind),
    ).toContain("format");
  });

  it("puts a pick on the other side after 'vs '", () => {
    const offered = searchSuggestions(context, "vs ghold");
    expect(offered).toHaveLength(1);
    expect(offered[0]).toMatchObject({
      kind: "pokemon",
      value: "Gholdengo",
      against: true,
      group: "Pokémon on the other side",
    });
  });

  it("narrows to one kind after 'move:' or 'lead:'", () => {
    const moves = searchSuggestions(context, "move:su");
    expect(moves.length).toBeGreaterThan(0);
    expect(moves.every((entry) => entry.kind === "move")).toBe(true);
    expect(searchSuggestions(context, "vs lead:garch")[0]).toMatchObject({
      kind: "lead",
      value: "Garchomp",
      against: true,
    });
  });

  it("ties what is typed to a Pokémon of the filter, on the side it is typed for", () => {
    const tied: SearchContext = {
      ...context,
      carriers: { has: carriers("Kingambit"), against: carriers("Garchomp") },
    };
    expect(searchSuggestions(tied, "sucker")[0]).toMatchObject({
      kind: "move",
      value: "Sucker Punch",
      on: "Kingambit",
      group: "On Kingambit",
    });
    expect(searchSuggestions(tied, "sucker")[1]).toMatchObject({
      value: "Sucker Punch",
      group: "Moves",
    });
    expect(searchSuggestions(tied, "vs stealth")[0]).toMatchObject({
      value: "Stealth Rock",
      on: "Garchomp",
      against: true,
      group: "On Garchomp on the other side",
    });
    expect(
      searchSuggestions(tied, "vs sucker").some(
        (entry) => entry.on !== undefined,
      ),
    ).toBe(false);
    expect(searchSuggestions(tied, "item:left")[0]).toMatchObject({
      value: "Leftovers",
      on: "Kingambit",
    });
  });

  it("names Tournaments with Games before those without", () => {
    const offered = searchSuggestions(context, "cup").filter(
      (entry) => entry.kind === "tournament",
    );
    expect(offered.at(-1)).toMatchObject({ value: "empty-cup", count: 0 });
  });

  it("offers the Match of a pasted replay", () => {
    expect(
      searchSuggestions(
        context,
        "https://replay.pokemonshowdown.com/gen9ou-2301234567",
      ),
    ).toEqual([
      {
        kind: "replay",
        value: "gen9ou-2301234567",
        label: "Open the Match of gen9ou-2301234567",
        group: "Replay",
        exclude: false,
        rest: "",
      },
    ]);
  });

  it("offers a pick for the last words and keeps the rest as text", () => {
    expect(searchSuggestions(context, "LordEnz kinga")[0]).toMatchObject({
      kind: "pokemon",
      value: "Kingambit",
      rest: "LordEnz",
    });
    // as many words as one pick stands for
    expect(searchSuggestions(context, "SPL alice alt")[0]).toMatchObject({
      kind: "player",
      value: "alice",
      rest: "SPL",
    });
    expect(searchSuggestions(context, "kingambit -great")[0]).toMatchObject({
      kind: "pokemon",
      value: "Great Tusk",
      exclude: true,
      rest: "kingambit",
    });
    expect(searchSuggestions(context, "nothing fits here")).toEqual([]);
  });

  it("offers a pick for the other side after 'vs' and takes the 'vs' with it", () => {
    expect(searchSuggestions(context, "alice vs ghold")[0]).toMatchObject({
      kind: "pokemon",
      value: "Gholdengo",
      against: true,
      rest: "alice",
    });
    expect(searchSuggestions(context, "alice vs")).toEqual([]);
  });
});
