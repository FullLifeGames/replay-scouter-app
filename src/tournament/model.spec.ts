import {
  alternatives,
  buildDirectory,
  buildPlayers,
  buildTeam,
  createPool,
  dateOfDay,
  decodeMatches,
  formatName,
  monthOfTime,
  shortFormatName,
  token,
} from "./model";
import {
  decoded,
  directory,
  gen8ouFile,
  gen9ouFile,
  indexFile,
  playersFile,
  tournamentsFile,
} from "./testData";

describe("the Tournament directory", () => {
  it("lists every Tournament with its threads and totals", () => {
    const spl = directory.tournamentsById.get("spl-xvi")!;
    expect(spl.category).toBe("Team Tournament");
    expect(spl.threads.map((thread) => thread.round)).toEqual([
      "Week 1",
      "Week 2",
    ]);
    expect(spl.matches).toBe(5);
    expect(spl.matchesWithGames).toBe(3);
    expect([spl.firstDay, spl.lastDay]).toEqual([20_000, 20_007]);
    expect(spl.formats).toEqual([
      { id: "gen9ou", games: 4 },
      { id: "gen8ou", games: 1 },
    ]);
    expect(directory.threads.get(101)!.tournament).toBe(spl);
  });

  it("names Formats, also unknown ones", () => {
    expect(formatName(directory, "gen9ou")).toBe("[Gen 9] OU");
    expect(shortFormatName(directory, "gen9ou")).toBe("SV OU");
    expect(shortFormatName(directory, "gen8ou")).toBe("SS OU");
    expect(formatName(directory, "gen3zu")).toBe("gen3zu");
  });

  it("names a generation's Formats by its games in short", () => {
    const names = [
      "[Gen 1] OU",
      "[Gen 2] OU",
      "[Gen 3] OU",
      "[Gen 4] OU",
      "[Gen 5] OU",
      "[Gen 6] OU",
      "[Gen 7] OU",
      "[Gen 8] OU",
      "[Gen 9] National Dex Doubles",
      "[Gen 7 Let's Go] OU",
      "[Gen 10] OU",
    ];
    const known = buildDirectory(
      {
        ...indexFile,
        formats: names.map((name, index) => ({
          id: `f${index}`,
          name,
          games: 1,
          matches: 1,
          lastDay: 0,
        })),
      },
      tournamentsFile,
    );
    expect(
      names.map((_, index) => shortFormatName(known, `f${index}`)),
    ).toEqual([
      "RBY OU",
      "GSC OU",
      "ADV OU",
      "DPP OU",
      "BW OU",
      "XY OU",
      "SM OU",
      "SS OU",
      "SV National Dex Doubles",
      "G7 Let's Go OU",
      "G10 OU",
    ]);
  });

  it("reads the Players with their Alts and Formats", () => {
    const alice = buildPlayers(playersFile).get("alice")!;
    expect(alice.name).toBe("Alice");
    expect(alice.alts).toContain("alice alt");
    expect(alice.games).toBe(5);
    expect(alice.formats[0]).toEqual({ id: "gen9ou", games: 4 });
  });
});

describe("decoding Matches", () => {
  it("puts the winner the thread names on the left and counts Games by Player", () => {
    const [weekOne] = decoded();
    expect(weekOne.left.player?.name).toBe("Alice");
    expect(weekOne.right.player?.name).toBe("Bob");
    expect([weekOne.left.wins, weekOne.right.wins]).toEqual([2, 1]);
    expect(weekOne.decided).toBe(true);
    expect(weekOne.flagged).toBe(false);
    expect(weekOne.formats).toEqual(["gen9ou", "gen8ou"]);
    expect(weekOne.thread?.round).toBe("Week 1");
    expect(weekOne.left.alts).toEqual(["alice alt"]);
    expect(weekOne.left.teams).toHaveLength(2);
  });

  it("keeps each Game's sides with the Player who played them, whatever side of the replay", () => {
    const [weekOne] = decoded();
    const second = weekOne.games[1];
    expect(second.sides[0].alt).toBe("Bobby");
    expect(second.left.alt).toBe("alice alt");
    expect(second.left.player?.key).toBe("alice");
    expect(second.left.won).toBe(false);
    expect(second.right.won).toBe(true);
    expect(second.left.opponent).toBe(second.right);
  });

  it("decodes a Team with its Sets and what it is searched by", () => {
    const [weekOne] = decoded();
    const team = weekOne.games[0].left.team!;
    expect(team.pokemon[0]).toEqual({
      name: "Kingambit",
      item: "Leftovers",
      ability: "Supreme Overlord",
      tera: "Dark",
      moves: ["Sucker Punch"],
      lead: false,
      otherNames: [],
    });
    expect(team.pokemon[1].lead).toBe(true);
    expect(team.tokens.has(token("pokemon", "kingambit"))).toBe(true);
    expect(team.tokens.has(token("move", "Sucker Punch", "Kingambit"))).toBe(
      true,
    );
    expect(team.tokens.has(token("move", "Sucker Punch", "Great Tusk"))).toBe(
      false,
    );
    expect(team.tokens.has(token("lead", "Great Tusk"))).toBe(true);
    expect(weekOne.games[2].right.team).toBeNull();
  });

  it("leaves a Game unattributed when the collector could not tell the sides", () => {
    const carolDave = decoded()[1];
    const [game] = carolDave.games;
    expect(game.attributed).toBe(false);
    expect(game.sides.map((side) => side.player)).toEqual([null, null]);
    expect(carolDave.left.player?.name).toBe("Carol");
    expect(carolDave.left.teams).toEqual([]);
    expect([carolDave.left.wins, carolDave.right.wins]).toEqual([0, 0]);
    expect(carolDave.decided).toBe(false);
    expect(game.left).toBe(game.sides[0]);
  });

  it("flags a Match whose replays disagree with the thread, and follows the thread", () => {
    const carolAlice = decoded()[2];
    expect(carolAlice.left.player?.name).toBe("Alice");
    expect(carolAlice.decided).toBe(true);
    expect(carolAlice.flagged).toBe(true);
    expect([carolAlice.left.wins, carolAlice.right.wins]).toEqual([0, 1]);
  });

  it("takes the day of the thread when the Match has none", () => {
    const ost = decoded()[3];
    expect(ost.day).toBe(19_400);
    expect(ost.decided).toBe(false);
    expect(ost.games[0].decided).toBe(false);
  });

  it("gives a Match found in two files once, with the same Teams", () => {
    const pool = createPool();
    const fromGen9 = decodeMatches(gen9ouFile, directory, pool);
    const fromGen8 = decodeMatches(gen8ouFile, directory, pool);
    expect(fromGen8).toHaveLength(1);
    expect(fromGen8[0]).toBe(fromGen9[0]);

    const other = createPool();
    const gen8First = decodeMatches(gen8ouFile, directory, other)[0];
    const gen9After = decodeMatches(gen9ouFile, directory, other);
    expect(gen9After[0]).toBe(gen8First);
    expect(gen8First.left.player?.name).toBe("Alice");
    // Alice's Team of Week 1 is one object, whichever file it came from
    expect(gen9After[0].games[0].left.team!.pokemon[0].name).toBe("Kingambit");
  });
});

describe("a Set the scouter saw with different values", () => {
  it("counts each value on its own", () => {
    expect(alternatives("Leftovers | Black Sludge")).toEqual([
      "Leftovers",
      "Black Sludge",
    ]);
    expect(alternatives("Fairy | Fairy")).toEqual(["Fairy"]);
    expect(alternatives(null)).toEqual([]);

    const team = buildTeam([
      {
        name: "Toxapex",
        item: "Leftovers | Black Sludge",
        ability: "Regenerator",
        tera: null,
        moves: [],
        lead: false,
        otherNames: [],
      },
    ]);
    expect(team.tokens.has(token("item", "Black Sludge", "Toxapex"))).toBe(
      true,
    );
    expect(team.tokens.has(token("item", "Leftovers | Black Sludge"))).toBe(
      false,
    );
  });
});

describe("dates", () => {
  it("writes days and months in UTC", () => {
    expect(dateOfDay(20_000)).toBe("04 Oct 2024");
    expect(dateOfDay(-1)).toBe("");
    expect(monthOfTime(20_000 * 86_400)).toBe("2024-10");
  });
});
