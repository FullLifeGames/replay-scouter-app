import { flushPromises, mount, type VueWrapper } from "@vue/test-utils";
import mitt from "mitt";
import type { ComponentCustomProperties } from "vue";
import { createMemoryHistory, createRouter, type Router } from "vue-router";
import { routes } from "@/router";
import {
  gen8ouFile,
  gen9ouFile,
  indexFile,
  playersFile,
  tournamentsFile,
} from "@/tournament/testData";
import TournamentTeamsPage from "./TournamentTeamsPage.vue";

/** The files of Matches/ as the page fetches them; the Tournament file holds more than its own Matches. */
const files: Record<string, unknown> = {
  "index.json": indexFile,
  "tournaments.json": tournamentsFile,
  "players.json": playersFile,
  "Formats/gen9ou.json": gen9ouFile,
  "Formats/gen8ou.json": gen8ouFile,
  "Tournaments/spl-xvi.json": gen9ouFile,
  "Tournaments/ost-xx.json": gen9ouFile,
};

const answer = (url: string) => {
  const path = Object.keys(files).find((known) => url.endsWith(known));
  return Promise.resolve({
    ok: path !== undefined,
    status: path === undefined ? 404 : 200,
    json: () => Promise.resolve(files[path ?? ""]),
  });
};

const textOf = (wrapper: { text: () => string }) =>
  wrapper.text().replaceAll(/\s+/g, " ");

describe("the Tournament Teams page", () => {
  let router: Router;
  let wrapper: VueWrapper;

  const open = async (path: string) => {
    router = createRouter({ history: createMemoryHistory(), routes });
    await router.push(path);
    await router.isReady();
    wrapper = mount(TournamentTeamsPage, {
      attachTo: document.body,
      global: {
        plugins: [router],
        config: {
          globalProperties: {
            emitter: mitt(),
          } as unknown as ComponentCustomProperties,
        },
      },
    });
    await flushPromises();
  };

  const go = async (query: Record<string, string>) => {
    await router.push({ path: "/tournamentTeams", query });
    await flushPromises();
  };

  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal("fetch", vi.fn(answer));
  });

  afterEach(() => {
    wrapper.unmount();
    vi.unstubAllGlobals();
  });

  it("opens with [Gen 9] OU on a first visit and counts only its Games", async () => {
    await open("/tournamentTeams");
    expect(router.currentRoute.value.query).toEqual({ f: "gen9ou" });
    expect(textOf(wrapper.get(".tt-rhead"))).toContain("4 Matches · 5 Games");
    expect(wrapper.findAll(".tt-match")).toHaveLength(4);
  });

  it("opens with the Formats of the last visit", async () => {
    localStorage.setItem("tournamentTeams.formats", "gen8ou");
    await open("/tournamentTeams");
    expect(router.currentRoute.value.query).toEqual({ f: "gen8ou" });
    expect(textOf(wrapper.get(".tt-rhead"))).toContain("1 Match · 1 Game");
  });

  it("shows a Match with its winner on the left and opens it into its Games", async () => {
    await open("/tournamentTeams?f=gen9ou&sort=games");
    const match = wrapper.get(".tt-match");
    expect(textOf(match.get(".tt-side"))).toContain("Alice");
    expect(textOf(match.get(".tt-score"))).toBe("2–1");

    await match.get(".tt-mrow").trigger("click");
    const games = match.findAll(".tt-game");
    expect(games).toHaveLength(3);
    // the Gen 8 Game belongs to the Match, but not to the search
    expect(games.map((game) => game.classes("off"))).toEqual([
      false,
      false,
      true,
    ]);
    expect(
      games[0].findAll("a").map((link) => link.attributes("href")),
    ).toEqual([
      "https://replay.pokemonshowdown.com/gen9ou-1",
      expect.stringContaining("gen9ou-1"),
      "https://www.smogon.com/forums/threads/100/",
    ]);
  });

  it("shows the replays' winner over the thread's and says where the sides are unknown", async () => {
    await open("/tournamentTeams?f=gen9ou");
    // the thread names Alice, the one replay has Carol winning
    const carolAlice = wrapper
      .findAll(".tt-match")
      .find(
        (match) =>
          textOf(match).includes("Alice") && textOf(match).includes("Carol"),
      );
    expect(textOf(carolAlice!.get(".tt-who b"))).toBe("Carol");
    expect(textOf(carolAlice!.get(".tt-score"))).toBe("1–0");
    expect(textOf(wrapper)).toContain("Thread: Carol vs Dave");
  });

  it("filters by what a Team has and marks it", async () => {
    await open("/tournamentTeams?f=gen9ou&has=Gholdengo");
    expect(wrapper.findAll(".tt-match")).toHaveLength(3);
    expect(textOf(wrapper.get(".tt-filters"))).toContain("Gholdengo");
    expect(wrapper.findAll(".tt-match .tt-pi.has").length).toBeGreaterThan(0);

    // Bob won one Game with it, and so did whoever played Dave's side
    await go({ f: "gen9ou", has: "Gholdengo", res: "won" });
    expect(textOf(wrapper.get(".tt-rhead"))).toContain("2 Matches · 2 Games");
  });

  it("lands a pick of the search box in the matching filter", async () => {
    await open("/tournamentTeams?f=gen9ou");
    const search = wrapper.get("#tt-search");
    await search.setValue("vs dragap");
    await search.trigger("keydown", { key: "ArrowDown" });
    await search.trigger("keydown", { key: "Enter" });
    await flushPromises();
    expect(router.currentRoute.value.query).toEqual({
      f: "gen9ou",
      vs: "Dragapult",
    });
  });

  it("searches the typed text and keeps it beside a pick", async () => {
    await open("/tournamentTeams?f=gen9ou");
    const search = wrapper.get("#tt-search");
    await search.setValue("bobby");
    await search.trigger("keydown", { key: "Enter" });
    await flushPromises();
    expect(router.currentRoute.value.query).toEqual({
      f: "gen9ou",
      q: "bobby",
    });
    expect(textOf(wrapper.get(".tt-rhead"))).toContain("1 Match · 2 Games");

    await search.setValue("bobby gholden");
    await search.trigger("keydown", { key: "ArrowDown" });
    await search.trigger("keydown", { key: "Enter" });
    await flushPromises();
    expect(router.currentRoute.value.query).toEqual({
      f: "gen9ou",
      q: "bobby",
      has: "Gholdengo",
    });
    expect((search.element as HTMLInputElement).value).toBe("bobby");
  });

  it("shows all Formats of the latest Tournaments when no Format is chosen", async () => {
    await open("/tournamentTeams?f=gen9ou");
    await wrapper.get('[aria-label="Remove [Gen 9] OU"]').trigger("click");
    await flushPromises();
    // not the bare URL, which would bring the Format of the last visit back
    expect(router.currentRoute.value.query).toEqual({ f: "all" });
    expect(textOf(wrapper.get(".tt-rhead"))).toContain("All Formats");
    expect(textOf(wrapper.get(".tt-rhead"))).toContain("4 Matches · 6 Games");
    expect(textOf(wrapper)).toContain(
      "All Formats, from the 2 Tournaments that ended last",
    );
  });

  it("lists the Matches of chosen Tournaments, by Round on request", async () => {
    await open("/tournamentTeams?t=spl-xvi");
    expect(wrapper.findAll(".tt-round")).toHaveLength(0);
    expect(wrapper.findAll(".tt-match")).toHaveLength(3);

    await go({ t: "spl-xvi,ost-xx" });
    expect(textOf(wrapper.get(".tt-rhead"))).toContain("SPL XVI + OST XX");
    expect(wrapper.findAll(".tt-match")).toHaveLength(4);
  });

  it("groups a Tournament by Round, with the thread of each", async () => {
    await open("/tournamentTeams?t=spl-xvi&g=round");
    expect(textOf(wrapper.get(".tt-rhead"))).toContain("SPL XVI");
    const rounds = wrapper.findAll(".tt-round");
    expect(rounds.map((round) => round.get("h3").text())).toEqual([
      "Week 2",
      "Week 1",
    ]);
    expect(rounds[0].get("header a").attributes("href")).toBe(
      "https://www.smogon.com/forums/threads/101/",
    );
    // OST's Match is in the file, but not in this Tournament
    expect(wrapper.findAll(".tt-match")).toHaveLength(3);
  });

  it("shows the Teams of the search as text", async () => {
    await open("/tournamentTeams?f=gen9ou&tab=teams&as=text");
    const text = (wrapper.get("textarea").element as HTMLTextAreaElement).value;
    expect(text).toContain("Kingambit");
    expect(text).toContain("https://replay.pokemonshowdown.com/gen9ou-1");
  });

  it("shows a usage table in the Classic text format", async () => {
    await open("/tournamentTeams?f=gen9ou&tab=stats&st=pokemon");
    expect(wrapper.findAll("table.tt-st tbody tr").length).toBeGreaterThan(0);
    const asText = wrapper
      .findAll("button")
      .find((button) => button.text() === "Text");
    await asText!.trigger("click");
    const text = (wrapper.get("textarea").element as HTMLTextAreaElement).value;
    expect(text).toContain("| Rank | Pokemon");
    expect(text).toContain("Kingambit");
  });

  it("lists the Tournaments of the search, or of the whole index", async () => {
    await open("/tournamentTeams?f=all&tab=tournaments");
    const rows = () => wrapper.findAll(".tt-trow:not(.head)");
    expect(rows()).toHaveLength(2);
    await wrapper.get(".tt-stack input[type=checkbox]").setValue(true);
    expect(rows()).toHaveLength(3);
    expect(
      rows()
        .map((row) => row.text())
        .join(" "),
    ).toContain("Empty Cup");
  });

  it("adds a Tournament from its tab to the filter and stays there", async () => {
    await open("/tournamentTeams?f=all&tab=tournaments");
    const row = wrapper
      .findAll(".tt-trow:not(.head)")
      .find((entry) => entry.text().includes("OST XX"));
    await row!.trigger("click");
    await flushPromises();
    expect(router.currentRoute.value.query).toEqual({
      t: "ost-xx",
      tab: "tournaments",
    });
    expect(wrapper.get(".tt-trow.on").text()).toContain("OST XX");
  });
});
