import { emptyFilter } from "./filter";
import { search } from "./query";
import {
  carriersOf,
  comboConditions,
  comboTable,
  coverage,
  pokemonDetail,
  pokemonOfRow,
  tableKinds,
  tally,
  usageOverTime,
  vocabularyOf,
  type Row,
} from "./statistics";
import { decoded } from "./testData";

const sides = () => search(decoded(), emptyFilter()).sides;

const kind = (id: string) => tableKinds.find((entry) => entry.id === id)!;

const table = (id: string) => tally(sides(), (team) => kind(id).keysOf(team));

const row = (rows: Row[], key: string) =>
  rows.find((entry) => entry.key === key);

describe("statistics tables", () => {
  it("counts every Game a Team was brought to as one use", () => {
    const pokemon = table("pokemon");
    // 12 sides, one of them without a Team
    expect(pokemon.total).toBe(11);
    // Alice's Team in four Games, Carol's in two
    expect(row(pokemon.rows, "Kingambit")).toEqual({
      key: "Kingambit",
      use: 6,
      wins: 2,
      decided: 5,
    });
    expect(pokemon.rows[0].key).toBe("Kingambit");
    expect(row(pokemon.rows, "Zamazenta")!.use).toBe(1);
  });

  it("counts leads, items, moves and Tera types", () => {
    expect(table("leads").rows.map((entry) => entry.key)).toEqual([
      "Great Tusk",
      "Garchomp",
    ]);
    expect(row(table("items").rows, "Choice Scarf")!.use).toBe(4);
    expect(row(table("moves").rows, "Earthquake")!.use).toBe(6);
    expect(row(table("tera").rows, "Dark")!.use).toBe(4);
    expect(row(table("tera").rows, "Fairy")!.use).toBe(2);
  });

  it("counts items and moves by Pokémon, written as the Classic view writes them", () => {
    expect(
      row(table("items-by-pokemon").rows, "Kingambit: Leftovers")!.use,
    ).toBe(4);
    expect(
      row(table("moves-by-pokemon").rows, "Garchomp: Stealth Rock")!.use,
    ).toBe(2);
    expect(
      row(table("moves-by-pokemon").rows, "Great Tusk: Earthquake")!.use,
    ).toBe(4);
  });

  it("turns a row into what a Team must have", () => {
    expect(kind("pokemon").conditions("Kingambit")).toEqual([
      { kind: "pokemon", name: "Kingambit", exclude: false },
    ]);
    expect(kind("items-by-pokemon").conditions("Type: Null: Eviolite")).toEqual(
      [{ kind: "item", name: "Eviolite", on: "Type: Null", exclude: false }],
    );
    expect(kind("leads").conditions("Garchomp")[0].kind).toBe("lead");
    expect(
      pokemonOfRow(kind("moves-by-pokemon"), "Garchomp: Stealth Rock"),
    ).toEqual(["Garchomp"]);
    expect(pokemonOfRow(kind("items"), "Leftovers")).toEqual([]);
  });
});

describe("combos", () => {
  it("counts pairs by name", () => {
    const pairs = comboTable(sides(), 2, false);
    expect(row(pairs.rows, "Great Tusk / Kingambit")!.use).toBe(4);
    expect(row(pairs.rows, "Garchomp / Kingambit")!.use).toBe(2);
    expect(comboTable(sides(), 3, false).rows).toEqual([]);
  });

  it("marks leads and lists them first when asked to", () => {
    const pairs = comboTable(sides(), 2, true);
    expect(row(pairs.rows, "(Lead) Great Tusk / Kingambit")!.use).toBe(4);
    expect(row(pairs.rows, "(Lead) Garchomp / Kingambit")!.use).toBe(2);
    expect(comboConditions("(Lead) Garchomp / Kingambit")).toEqual([
      { kind: "lead", name: "Garchomp", exclude: false },
      { kind: "pokemon", name: "Kingambit", exclude: false },
    ]);
    expect(pokemonOfRow("combos", "(Lead) Garchomp / Kingambit")).toEqual([
      "Garchomp",
      "Kingambit",
    ]);
  });
});

describe("one Pokémon", () => {
  it("shows its Sets, teammates and how it did against the other side", () => {
    const detail = pokemonDetail("Kingambit", sides());
    expect([detail.use, detail.wins, detail.decided]).toEqual([6, 2, 5]);
    expect(detail.items.rows).toEqual([
      { key: "Leftovers", use: 4, wins: 1, decided: 3 },
    ]);
    expect(detail.teras.rows.map((entry) => entry.key)).toEqual([
      "Dark",
      "Fairy",
    ]);
    expect(detail.teammates.rows.map((entry) => entry.key)).toEqual([
      "Great Tusk",
      "Garchomp",
    ]);
    // against Gholdengo: Alice's Games 1, 2 and 6 and Carol's Game 4
    expect(row(detail.opponents.rows, "Gholdengo")).toEqual({
      key: "Gholdengo",
      use: 4,
      wins: 1,
      decided: 3,
    });
  });
});

describe("usage over time", () => {
  it("gives the share per month for each line", () => {
    const timeline = usageOverTime(
      sides(),
      [
        { kind: "pokemon", name: "Kingambit", exclude: false },
        { kind: "pokemon", name: "Gholdengo", exclude: false },
      ],
      (condition) => condition.name,
      2,
    );
    expect(timeline.months).toEqual(["2023-02", "2024-10"]);
    expect(timeline.totals).toEqual([2, 9]);
    expect(timeline.lines[0]).toEqual({
      label: "Kingambit",
      shares: [0.5, 5 / 9],
    });
    expect(timeline.lines[1].shares).toEqual([0.5, 4 / 9]);
  });

  it("leaves out months with too few Teams", () => {
    const timeline = usageOverTime(sides(), [], () => "", 5);
    expect(timeline.months).toEqual(["2024-10"]);
  });
});

describe("what a search covers", () => {
  it("counts Games, Matches, Tournaments and Players", () => {
    expect(coverage(sides())).toEqual({
      games: 6,
      matches: 4,
      tournaments: 2,
      players: 3,
      firstDay: 19_400,
      lastDay: 20_007,
    });
    expect(coverage([]).firstDay).toBe(-1);
  });

  it("collects what can be searched for", () => {
    const vocabulary = vocabularyOf(sides());
    expect(vocabulary.pokemon.get("Kingambit")).toBe(6);
    expect(vocabulary.move.get("Stealth Rock")).toBe(2);
    expect(vocabulary.lead.get("Garchomp")).toBe(2);
    expect(vocabulary.tera.get("Dark")).toBe(4);
    expect(vocabulary.ability.get("Supreme Overlord")).toBe(4);
  });

  it("collects what a Pokémon carried, for the Pokémon asked about", () => {
    const [garchomp, kingambit, ...others] = carriersOf(sides(), [
      "garchomp",
      "Kingambit",
      "Zapdos",
      "Garchomp",
    ]);
    expect(others).toEqual([]);
    expect(garchomp.name).toBe("Garchomp");
    expect([...garchomp.carried.move]).toEqual([
      ["Earthquake", 2],
      ["Stealth Rock", 2],
    ]);
    expect(garchomp.carried.item.size).toBe(0);
    // Alice's Kingambit in four Games, Carol's in two
    expect(kingambit.carried.move.get("Sucker Punch")).toBe(6);
    expect(kingambit.carried.item.get("Leftovers")).toBe(4);
    expect(kingambit.carried.ability.get("Supreme Overlord")).toBe(4);
    expect([...kingambit.carried.tera]).toEqual([
      ["Dark", 4],
      ["Fairy", 2],
    ]);
  });
});
