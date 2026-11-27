import {
  conditionText,
  countFilters,
  defaultState,
  formatOfReplay,
  parseCondition,
  parseState,
  pokemonInAll,
  pokemonOf,
  replayIdOf,
  toQuery,
  withCondition,
  withConditionsInAll,
  withoutCondition,
  withToggledCondition,
  type Condition,
} from "./filter";

const has = (name: string): Condition => ({
  kind: "pokemon",
  name,
  exclude: false,
});

describe("Conditions as text", () => {
  it("reads kinds, exclusions and the Pokémon a Set entry sits on", () => {
    expect(parseCondition("Kingambit")).toEqual(has("Kingambit"));
    expect(parseCondition("-Great Tusk")).toEqual({
      ...has("Great Tusk"),
      exclude: true,
    });
    expect(parseCondition("move:Sucker Punch")).toEqual({
      kind: "move",
      name: "Sucker Punch",
      exclude: false,
    });
    expect(parseCondition("-item:Leftovers@Kingambit")).toEqual({
      kind: "item",
      name: "Leftovers",
      on: "Kingambit",
      exclude: true,
    });
    expect(parseCondition("  ")).toBeNull();
  });

  it("keeps a Pokémon whose name has a colon", () => {
    expect(parseCondition("Type: Null")).toEqual(has("Type: Null"));
  });

  it("writes what it reads", () => {
    for (const text of [
      "Kingambit",
      "-Great Tusk",
      "move:Sucker Punch",
      "tera:Fairy@Kingambit",
      "lead:Garchomp",
    ]) {
      expect(conditionText(parseCondition(text)!)).toBe(text);
    }
  });
});

describe("changing Conditions", () => {
  it("adds to a group, replaces the same Condition and starts an alternative", () => {
    let groups = withCondition([], 0, has("Kingambit"));
    groups = withCondition(groups, 0, has("Gholdengo"));
    groups = withCondition(groups, 0, { ...has("kingambit"), exclude: true });
    groups = withCondition(groups, 1, has("Garchomp"));
    expect(groups).toEqual([
      [{ ...has("kingambit"), exclude: true }, has("Gholdengo")],
      [has("Garchomp")],
    ]);
  });

  it("requires a statistics row in every alternative", () => {
    expect(withConditionsInAll([], [has("Kingambit")])).toEqual([
      [has("Kingambit")],
    ]);
    expect(
      withConditionsInAll(
        [[has("Garchomp")], [has("Dragapult")]],
        [has("Kingambit")],
      ),
    ).toEqual([
      [has("Garchomp"), has("Kingambit")],
      [has("Dragapult"), has("Kingambit")],
    ]);
  });

  it("removes and flips single Conditions, dropping an emptied group", () => {
    const groups = [[has("Kingambit"), has("Gholdengo")], [has("Garchomp")]];
    expect(withoutCondition(groups, 1, 0)).toEqual([groups[0]]);
    expect(withToggledCondition(groups, 0, 1)[0][1].exclude).toBe(true);
  });
});

describe("the state in the URL", () => {
  it("leaves the defaults out", () => {
    expect(toQuery(defaultState())).toEqual({});
    expect(parseState({})).toEqual(defaultState());
  });

  it("round-trips a full state", () => {
    const state = {
      ...defaultState(),
      formats: ["gen9ou", "gen8ou"],
      has: [
        [has("Kingambit"), { ...has("Great Tusk"), exclude: true }],
        [{ kind: "move" as const, name: "Stealth Rock", exclude: false }],
      ],
      against: [[has("Gholdengo")]],
      outcome: "won" as const,
      player: "alice",
      tournament: "spl-xvi",
      round: "Week 1",
      categories: ["Official", "Team Tournament"],
      fromYear: 2020,
      toYear: null,
      tab: "stats" as const,
      sort: "views" as const,
      reversed: true,
      teamsAs: "text" as const,
      statsFormat: "gen8ou",
      statsTable: "combos",
      replay: "gen9ou-1",
    };
    const query = toQuery(state);
    expect(query).toEqual({
      f: "gen9ou,gen8ou",
      has: "Kingambit,-Great Tusk~move:Stealth Rock",
      vs: "Gholdengo",
      res: "won",
      p: "alice",
      t: "spl-xvi",
      r: "Week 1",
      c: "Official,Team Tournament",
      y: "2020-",
      tab: "stats",
      sort: "views",
      rev: "1",
      as: "text",
      sf: "gen8ou",
      st: "combos",
      m: "gen9ou-1",
    });
    expect(parseState(query)).toEqual(state);
  });

  it("ignores what it cannot read", () => {
    const state = parseState({
      f: ["GEN9OU, gen9ou"],
      res: "drawn",
      tab: "nonsense",
      sort: "luck",
      y: "abc-2024",
      r: "Week 1",
    });
    expect(state.formats).toEqual(["gen9ou"]);
    expect(state.outcome).toBe("any");
    expect(state.tab).toBe("matches");
    expect(state.sort).toBe("date");
    expect([state.fromYear, state.toYear]).toEqual([null, 2024]);
    // a Round means nothing without its Tournament
    expect(state.round).toBeNull();
  });

  it("counts the filters that are set", () => {
    expect(countFilters(defaultState())).toBe(0);
    expect(
      countFilters({
        ...defaultState(),
        formats: ["gen9ou"],
        has: [[has("Kingambit"), has("Gholdengo")]],
        player: "alice",
        fromYear: 2020,
      }),
    ).toBe(5);
  });
});

describe("the Pokémon a group asks for", () => {
  it("names them newest first, also through what is tied to one", () => {
    const group: Condition[] = [
      has("Kingambit"),
      { kind: "move", name: "Stealth Rock", on: "Garchomp", exclude: false },
      { ...has("Dragapult"), exclude: true },
      { kind: "item", name: "Leftovers", on: "Gholdengo", exclude: true },
      { kind: "item", name: "Choice Scarf", exclude: false },
      { kind: "lead", name: "kingambit", exclude: false },
    ];
    expect(pokemonOf(group)).toEqual(["kingambit", "Garchomp"]);
    expect(pokemonOf([])).toEqual([]);
  });

  it("names for all alternatives together only what each of them asks for", () => {
    expect(pokemonInAll([])).toEqual([]);
    expect(pokemonInAll([[has("Kingambit"), has("Garchomp")]])).toEqual([
      "Garchomp",
      "Kingambit",
    ]);
    expect(
      pokemonInAll([
        [has("Kingambit"), has("Garchomp")],
        [has("garchomp"), has("Dragapult")],
      ]),
    ).toEqual(["Garchomp"]);
  });
});

describe("replay links", () => {
  it("finds the replay id in a link or a bare id", () => {
    expect(
      replayIdOf("https://replay.pokemonshowdown.com/gen9ou-2301234567"),
    ).toBe("gen9ou-2301234567");
    expect(
      replayIdOf("replay.pokemonshowdown.com/smogtours-gen7ou-848706.json?p2"),
    ).toBe("smogtours-gen7ou-848706");
    expect(replayIdOf("gen9ou-2301234567-abc123pw")).toBe(
      "gen9ou-2301234567-abc123pw",
    );
    expect(replayIdOf("Kingambit")).toBeNull();
    expect(replayIdOf("Great Tusk")).toBeNull();
    expect(replayIdOf("Porygon-2")).toBeNull();
  });

  it("names the Format of a replay", () => {
    expect(formatOfReplay("gen9ou-2301234567")).toBe("gen9ou");
    expect(formatOfReplay("smogtours-gen7ou-848706")).toBe("gen7ou");
    expect(formatOfReplay("gen9ou-2301234567-abc123pw")).toBe("gen9ou");
  });
});
