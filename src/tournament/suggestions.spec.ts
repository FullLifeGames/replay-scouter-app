import { emptyFilter } from "./filter";
import { buildPlayers } from "./model";
import { search } from "./query";
import { vocabularyOf } from "./statistics";
import {
  conditionSuggestions,
  formatSuggestions,
  playerSuggestions,
  searchSuggestions,
  tournamentSuggestions,
  type SearchContext,
} from "./suggestions";
import { decoded, directory, playersFile } from "./testData";

const vocabulary = vocabularyOf(search(decoded(), emptyFilter()).sides);
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
      detail: "Team Tournament, 2024",
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
      },
    ]);
  });
});
