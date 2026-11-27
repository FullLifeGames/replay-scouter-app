import { emptyFilter, type Condition, type Filter } from "./filter";
import { parseText, search, sortMatches, sortTeams, teamsOf } from "./query";
import { decoded, formatNames } from "./testData";

const has = (name: string, exclude = false): Condition => ({
  kind: "pokemon",
  name,
  exclude,
});

const find = (filter: Partial<Filter>) =>
  search(decoded(), { ...emptyFilter(), ...filter });

const replays = (filter: Partial<Filter>) =>
  find(filter).games.map((game) => game.id);

const alts = (filter: Partial<Filter>) =>
  find(filter).sides.map((side) => `${side.alt}@${side.game.id}`);

const one = (condition: Omit<Condition, "exclude">) =>
  alts({ has: [[{ ...condition, exclude: false }]] });

const players = (key: Parameters<typeof sortMatches>[1], reversed = false) =>
  sortMatches(decoded(), key, reversed, [], formatNames).map(
    (match) => `${match.left.player?.name}-${match.right.player?.name}`,
  );

describe("search", () => {
  it("finds everything without a filter, with both sides of every Game", () => {
    const result = find({});
    expect(result.matches).toHaveLength(4);
    expect(result.games).toHaveLength(6);
    expect(result.sides).toHaveLength(12);
  });

  it("counts only the Games in the chosen Formats, while the Match stays whole", () => {
    const result = find({ formats: ["gen9ou"] });
    expect(result.matches).toHaveLength(4);
    expect(result.games.map((game) => game.id)).not.toContain("gen8ou-3");
    expect(result.matches[0].games).toHaveLength(3);

    expect(replays({ formats: ["gen8ou"] })).toEqual(["gen8ou-3"]);
    expect(find({ formats: ["gen8ou"] }).matches).toHaveLength(1);
    expect(replays({ formats: ["gen9ou", "gen8ou"] })).toHaveLength(6);
  });

  it("finds the sides whose Team has every Condition of a group", () => {
    expect(alts({ has: [[has("Kingambit"), has("Great Tusk")]] })).toEqual([
      "alice alt@gen9ou-1",
      "alice alt@gen9ou-2",
      "Alice@gen9ou-5",
      "alice alt@gen9ou-6",
    ]);
    expect(
      alts({ has: [[has("Kingambit"), has("Great Tusk", true)]] }),
    ).toEqual(["carol@gen9ou-4", "Carol@gen9ou-5"]);
  });

  it("takes alternatives as or", () => {
    expect(alts({ has: [[has("Zamazenta")], [has("Garchomp")]] })).toEqual([
      "alice alt@gen8ou-3",
      "carol@gen9ou-4",
      "Carol@gen9ou-5",
    ]);
  });

  it("matches moves, items, Tera types and leads, also on one Pokémon", () => {
    expect(one({ kind: "move", name: "stealth rock" })).toEqual([
      "carol@gen9ou-4",
      "Carol@gen9ou-5",
    ]);
    expect(one({ kind: "item", name: "Choice Scarf" })).toHaveLength(4);
    expect(one({ kind: "lead", name: "Garchomp" })).toHaveLength(2);
    expect(one({ kind: "lead", name: "Kingambit" })).toEqual([]);
    expect(one({ kind: "tera", name: "Fairy", on: "Kingambit" })).toHaveLength(
      2,
    );
    expect(one({ kind: "tera", name: "Fairy", on: "Garchomp" })).toEqual([]);
    expect(
      one({ kind: "move", name: "Earthquake", on: "Great Tusk" }),
    ).toHaveLength(4);
  });

  it("looks at the other side for 'against'", () => {
    // also Bob's side of the Gen 8 Game, although his own Team was not scouted
    expect(alts({ against: [[has("Gholdengo")]] })).toEqual([
      "alice alt@gen9ou-1",
      "alice alt@gen9ou-2",
      "Bobby@gen8ou-3",
      "carol@gen9ou-4",
      "alice alt@gen9ou-6",
    ]);
    // the Team that was not scouted meets only exclusions
    expect(alts({ against: [[has("Gholdengo", true)]] })).toContain(
      "alice alt@gen8ou-3",
    );
    expect(
      alts({ has: [[has("Garchomp")]], against: [[has("Great Tusk")]] }),
    ).toEqual(["Carol@gen9ou-5"]);
  });

  it("filters by the outcome of the Game, leaving out Games without a winner", () => {
    expect(alts({ outcome: "won" })).toEqual([
      "alice alt@gen9ou-1",
      "Bobby@gen9ou-2",
      "alice alt@gen8ou-3",
      "xX_who_Xx@gen9ou-4",
      "Carol@gen9ou-5",
    ]);
    expect(alts({ outcome: "lost", has: [[has("Kingambit")]] })).toEqual([
      "alice alt@gen9ou-2",
      "carol@gen9ou-4",
      "Alice@gen9ou-5",
    ]);
  });

  it("finds a Player's sides under every Alt", () => {
    expect(alts({ player: "alice" })).toEqual([
      "alice alt@gen9ou-1",
      "alice alt@gen9ou-2",
      "alice alt@gen8ou-3",
      "Alice@gen9ou-5",
      "alice alt@gen9ou-6",
    ]);
  });

  it("counts a Player's Game whose sides are unknown, but neither Team", () => {
    const result = find({ player: "carol" });
    expect(result.games.map((game) => game.id)).toEqual([
      "gen9ou-4",
      "gen9ou-5",
    ]);
    expect(result.sides.map((side) => side.alt)).toEqual(["Carol"]);
    // with a filter on the Team, the Game cannot be checked and stays out
    expect(replays({ player: "carol", has: [[has("Garchomp")]] })).toEqual([
      "gen9ou-5",
    ]);
    expect(replays({ player: "dave" })).toEqual(["gen9ou-4"]);
  });

  it("filters by Tournaments, Round and years", () => {
    expect(find({ tournaments: ["spl-xvi"] }).matches).toHaveLength(3);
    expect(find({ tournaments: ["spl-xvi", "ost-xx"] }).matches).toHaveLength(
      4,
    );
    expect(
      find({ tournaments: ["spl-xvi"], round: "Week 2" }).matches,
    ).toHaveLength(2);
    expect(find({ fromYear: 2024 }).matches).toHaveLength(3);
    expect(find({ toYear: 2023 }).matches).toHaveLength(1);
    expect(find({ fromYear: 2025 }).matches).toHaveLength(0);
  });
});

describe("free text", () => {
  it("reads words, phrases, exclusions and the other side", () => {
    expect(parseText(' LordEnz vs -Kingambit "great tusk" item: ')).toEqual({
      mine: [{ id: "lordenz", exclude: false }],
      theirs: [
        { id: "kingambit", exclude: true },
        { id: "greattusk", exclude: false },
      ],
    });
    // the kind in front is for the suggestions; the text searches the word anywhere
    expect(parseText("move:sucker -").mine).toEqual([
      { id: "sucker", exclude: false },
    ]);
  });

  it("finds a Showdown name or a Player on their own side only", () => {
    expect(alts({ text: "bobby" })).toEqual([
      "Bobby@gen9ou-1",
      "Bobby@gen9ou-2",
      "Bobby@gen8ou-3",
    ]);
    // Bob also by his Smogon name, in the OST Game as "bob"
    expect(alts({ text: "Bob" })).toHaveLength(4);
  });

  it("finds Tournaments, Rounds, years and Formats on both sides", () => {
    expect(find({ text: "SPL" }).matches).toHaveLength(3);
    expect(find({ text: "SPL" }).sides).toHaveLength(10);
    expect(find({ text: "ost 2023" }).matches).toHaveLength(1);
    expect(find({ text: '"week 2"' }).matches).toHaveLength(2);
    expect(replays({ text: "gen8" })).toEqual(["gen8ou-3"]);
  });

  it("finds what the Teams show", () => {
    expect(alts({ text: "kingambit" })).toHaveLength(6);
    expect(alts({ text: '"great tusk"' })).toEqual([
      "alice alt@gen9ou-1",
      "alice alt@gen9ou-2",
      "Alice@gen9ou-5",
      "alice alt@gen9ou-6",
    ]);
    expect(alts({ text: "move:sucker" })).toHaveLength(6);
  });

  it("leaves out words with '-' and looks at the other side after 'vs'", () => {
    expect(alts({ text: "kingambit -carol" })).toHaveLength(4);
    expect(alts({ text: "alice vs gholdengo" })).toEqual([
      "alice alt@gen9ou-1",
      "alice alt@gen9ou-2",
      "alice alt@gen9ou-6",
    ]);
    expect(alts({ text: "alice vs -gholdengo" })).toEqual([
      "alice alt@gen8ou-3",
      "Alice@gen9ou-5",
    ]);
  });

  it("works with the other filters", () => {
    expect(
      alts({ text: "alice", has: [[has("Kingambit")]], formats: ["gen9ou"] }),
    ).toEqual([
      "alice alt@gen9ou-1",
      "alice alt@gen9ou-2",
      "Alice@gen9ou-5",
      "alice alt@gen9ou-6",
    ]);
  });
});

describe("order", () => {
  it("sorts Matches newest first, and the other way round", () => {
    expect(players("date")).toEqual([
      "Carol-Alice",
      "Carol-Dave",
      "Alice-Bob",
      "Alice-Bob",
    ]);
    expect(players("date", true).at(-1)).toBe("Carol-Alice");
  });

  it("sorts Matches by Games, views, rating, Player and Format", () => {
    expect(players("games")[0]).toBe("Alice-Bob");
    expect(players("views")[0]).toBe("Alice-Bob");
    expect(players("rating")[0]).toBe("Carol-Alice");
    // by the Player on the left: the winner
    const left = (reversed: boolean) =>
      players("player", reversed).map((pair) => pair.split("-")[0]);
    expect(left(false)).toEqual(["Alice", "Alice", "Carol", "Carol"]);
    expect(left(true)).toEqual(["Carol", "Carol", "Alice", "Alice"]);
    const byFormat = sortMatches(
      decoded(),
      "format",
      false,
      ["gen8ou"],
      formatNames,
    );
    expect(byFormat[0].formats).toContain("gen8ou");
  });

  it("groups the sides of a search into Teams with their Games", () => {
    const teams = teamsOf(find({}).sides);
    expect(teams).toHaveLength(4);
    const alices = teams.find(
      (use) => use.team.pokemon[1]?.name === "Great Tusk",
    )!;
    expect(alices.sides.map((side) => side.game.id)).toEqual([
      "gen9ou-1",
      "gen9ou-2",
      "gen9ou-5",
      "gen9ou-6",
    ]);
    const sorted = sortTeams(teams, "games", false, formatNames);
    expect(sorted[0].sides).toHaveLength(4);
    expect(sortTeams(teams, "games", true, formatNames)[0].sides).toHaveLength(
      1,
    );
  });
});
