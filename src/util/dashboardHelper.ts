export const PS_DASHBOARD_URL = "https://fulllifegames.com/Tools/PSDashboard";

const replayPattern = /^https?:\/\/replay\.pokemonshowdown\.com\/([^#/?]+)/i;

export const isShowdownReplay = (link: string): boolean =>
  replayPattern.test(link);

// "https://replay.pokemonshowdown.com/gen9ou-123.json?p2" -> "gen9ou-123"
export const getReplayId = (replayLink: string): string => {
  const match = replayLink.match(replayPattern);
  const id = match ? match[1] : replayLink;
  return id.replace(/\.(json|log)$/i, "");
};

export const getAnalyzeLink = (replayLink: string): string =>
  `${PS_DASHBOARD_URL}?replay=${encodeURIComponent(getReplayId(replayLink))}`;
