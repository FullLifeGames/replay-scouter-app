export const PS_DASHBOARD_URL = "https://fulllifegames.com/Tools/PSDashboard";

const replayPattern = /^https?:\/\/replay\.pokemonshowdown\.com\//i;

export const isShowdownReplay = (link: string): boolean =>
  replayPattern.test(link);

export const getAnalyzeLink = (replayLink: string): string =>
  `${PS_DASHBOARD_URL}?replay=${encodeURIComponent(replayLink)}`;
