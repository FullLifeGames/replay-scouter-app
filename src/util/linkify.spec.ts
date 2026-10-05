import { linkify } from "./linkify";
import { getAnalyzeLink, PS_DASHBOARD_URL } from "./dashboardHelper";

const replay = "https://replay.pokemonshowdown.com/gen9ou-123456";

describe("linkify", () => {
  it("does not add analyze links by default", () => {
    expect(linkify(replay)).not.toContain(PS_DASHBOARD_URL);
  });

  it("adds an analyze link after showdown replays", () => {
    const result = linkify(replay, { analyzeReplays: true });
    expect(result).toContain(`href="${replay}"`);
    expect(result).toContain(`href="${PS_DASHBOARD_URL}?replay=gen9ou-123456"`);
    expect(result).toContain("Analyze <svg");
  });

  it("does not add analyze links to other urls", () => {
    expect(
      linkify("https://example.com/foo", { analyzeReplays: true }),
    ).not.toContain(PS_DASHBOARD_URL);
  });
});

describe("getAnalyzeLink", () => {
  it("passes only the replay id", () => {
    expect(
      getAnalyzeLink(
        "https://replay.pokemonshowdown.com/gen3customgame-2115579570.json?p2",
      ),
    ).toBe(`${PS_DASHBOARD_URL}?replay=gen3customgame-2115579570`);
  });
});
