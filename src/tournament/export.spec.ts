import type { Team as ApiTeam } from "@/api";
import type { StatsDict } from "@/types/stats";
import {
  renderUsageDict,
  renderUsageDictCsv,
} from "@/util/statisticFormatting";
import { teamsJson, teamsText, toApiTeam, usageCsv, usageText } from "./export";
import { emptyFilter } from "./filter";
import { search, teamsOf } from "./query";
import { tableKinds, tally } from "./statistics";
import { decoded, formatNames } from "./testData";

const sides = () => search(decoded(), emptyFilter()).sides;

const apiTeams = () =>
  teamsOf(sides()).map((use) => toApiTeam(use, formatNames));

/** The Classic view's count of the same Teams, as PokemonStatistics.vue does it. */
const classicDict = (teams: ApiTeam[], names: (team: ApiTeam) => string[]) => {
  const dict: StatsDict = {};
  for (const team of teams) {
    const replays = team.replays ?? [];
    for (const name of new Set(names(team))) {
      dict[name] ??= { use: 0, wins: 0, wonGames: 0 };
      dict[name].use += replays.length;
      dict[name].wins += replays.filter((replay) => replay.winForTeam).length;
      dict[name].wonGames += replays.filter((replay) => replay.winner).length;
    }
  }
  return dict;
};

const classic = () =>
  classicDict(apiTeams(), (team) =>
    (team.pokemon ?? []).map((mon) => mon.name ?? ""),
  );

const unranked = (text: string) =>
  text
    .split("\n")
    .map((line) => line.replace(/^\| \d+ +\|/, "|"))
    .toSorted();

describe("statistics as text", () => {
  const kind = tableKinds.find((entry) => entry.id === "pokemon")!;
  const table = () => tally(sides(), (team) => kind.keysOf(team));
  it("writes the Classic view's table", () => {
    const text = usageText(table(), "Pokemon");
    expect(text.split("\n").slice(0, 4)).toEqual([
      "+ ---- + ------------------ + ---- + ------- + ------- +",
      "| Rank | Pokemon            | Use  | Usage % |  Win %  |",
      "+ ---- + ------------------ + ---- + ------- + ------- +",
      "| 1    | Kingambit          |    6 |  54.55% |  40.00% |",
    ]);
    // the same lines; only the order among entries with equal use differs
    expect(unranked(text)).toEqual(
      unranked(renderUsageDict(classic(), apiTeams(), "Pokemon")),
    );
  });

  it("widens the table for long entries and labels", () => {
    const moves = tableKinds.find((entry) => entry.id === "moves-by-pokemon")!;
    const text = usageText(
      tally(sides(), (team) => moves.keysOf(team)),
      moves.label,
    );
    const lines = text.split("\n");
    expect(lines[1]).toContain(`| ${"Moves By Pokémon".padEnd(23)} |`);
    expect(new Set(lines.map((line) => line.length)).size).toBe(1);
  });

  it("cuts the text after a number of rows", () => {
    expect(usageText(table(), "Pokemon", 2).split("\n")).toHaveLength(5);
  });

  it("writes the Classic view's CSV", () => {
    const csv = usageCsv(table());
    expect(csv.split("\n")[0]).toBe("Pokemon;Use;Usage %;Win %");
    expect(csv.split("\n")[1]).toBe("Kingambit;6;54.55%;40.00%");
    expect(csv.split("\n").toSorted()).toEqual(
      renderUsageDictCsv(classic(), apiTeams()).split("\n").toSorted(),
    );
  });
});

describe("Teams as text and JSON", () => {
  it("gives a Team in the Scouter's shape, with its Games as replays", () => {
    const team = apiTeams().find(
      (entry) => entry.pokemon?.[1]?.name === "Great Tusk",
    )!;
    expect(team.pokemon![0]).toMatchObject({
      name: "Kingambit",
      item: "Leftovers",
      ability: "Supreme Overlord",
      teraType: "Dark",
      moves: ["Sucker Punch"],
      lead: false,
    });
    expect(team.replays).toHaveLength(4);
    expect(team.replays![1]).toMatchObject({
      id: "gen9ou-2",
      link: "https://replay.pokemonshowdown.com/gen9ou-2",
      formatId: "gen9ou",
      format: "[Gen 9] OU",
      players: ["Bobby", "alice alt"],
      winner: "Bobby",
      winForTeam: false,
      playerInfo: { playerName: "alice alt", playerValue: "p2" },
    });
    expect(team.replays![3].winner).toBeNull();
  });

  it("writes the Classic view's text", () => {
    const text = teamsText("SPL XVI", apiTeams());
    expect(text.startsWith("SPL XVI\n\n")).toBe(true);
    expect(text).toContain(
      "(Lead) Great Tusk, Kingambit:\n" +
        "https://replay.pokemonshowdown.com/gen9ou-1\n" +
        "https://replay.pokemonshowdown.com/gen9ou-2\n" +
        "https://replay.pokemonshowdown.com/gen9ou-5\n" +
        "https://replay.pokemonshowdown.com/gen9ou-6\n\n" +
        "Great Tusk\n- Earthquake\n\n" +
        "Kingambit @ Leftovers\nAbility: Supreme Overlord\nTera Type: Dark\n- Sucker Punch",
    );
    expect(text.match(/:\nhttps/g)).toHaveLength(4);
  });

  it("writes the Teams as JSON", () => {
    expect(JSON.parse(teamsJson(apiTeams()))).toHaveLength(4);
  });
});
