// Thanks ChatGPT

import type { Team } from "@/api";
import {
  formatRegardingIndex,
  formatPercentage,
  getNumberOfBattles,
  renderUsageDict,
} from "./statisticFormatting";

describe("formatRegardingIndex", () => {
  it("should format the entry as specified by the index and alignment", () => {
    expect(formatRegardingIndex("4", 1)).toEqual("4   ");
    expect(formatRegardingIndex("Pikachu", 2)).toEqual("Pikachu           ");
    expect(formatRegardingIndex("25", 3)).toEqual("  25");
    expect(formatRegardingIndex(formatPercentage(0.753), 4)).toEqual(" 75.30%");
    expect(formatRegardingIndex(formatPercentage(0.654), 5)).toEqual(" 65.40%");
    expect(formatRegardingIndex("7", 1, [3, 8, 3, 7, 7])).toEqual("7  ");
    expect(formatRegardingIndex("Gyarados", 2, [3, 8, 3, 7, 7])).toEqual(
      "Gyarados",
    );
  });
});

describe("formatPercentage", () => {
  it("should format the number as a percentage with two decimal places", () => {
    expect(formatPercentage(0)).toEqual("0.00%");
    expect(formatPercentage(0.5)).toEqual("50.00%");
    expect(formatPercentage(1)).toEqual("100.00%");
    expect(formatPercentage(0.753)).toEqual("75.30%");
    expect(formatPercentage(0.654)).toEqual("65.40%");
  });
});

describe("getNumberOfBattles", () => {
  it("should return the total number of battles across all teams", () => {
    const teams = [
      { replays: [{}, {}] },
      { replays: [{}] },
      { replays: [{}, {}, {}, {}] },
      {},
    ];
    expect(getNumberOfBattles(teams)).toEqual(7);
  });
});

describe("renderUsageDict", () => {
  it("should render the correct output", () => {
    const dict = {
      Pikachu: { use: 1200, wins: 600, wonGames: 1000 },
      Charizard: { use: 900, wins: 400, wonGames: 900 },
      Gyarados: { use: 800, wins: 300, wonGames: 799 },
    };
    const teams: Team[] = Array.from<Team>({ length: 2000 }).fill({
      replays: [{}],
    });
    const expectedOutput =
      "+ ---- + ------------------ + ---- + ------- + ------- +" +
      "\n| Rank | Pokemon            | Use  | Usage % |  Win %  |" +
      "\n+ ---- + ------------------ + ---- + ------- + ------- +" +
      "\n| 1    | Pikachu            | 1200 |  60.00% |  60.00% |" +
      "\n| 2    | Charizard          |  900 |  45.00% |  44.44% |" +
      "\n| 3    | Gyarados           |  800 |  40.00% |  37.55% |";

    expect(renderUsageDict(dict, teams)).toEqual(expectedOutput);
  });
});
