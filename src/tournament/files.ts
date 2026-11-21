/**
 * The files the collector writes into Matches/ each night, as they come over the wire
 * (docs/adr/0001-tournament-data-as-static-files.md). Every file carries a version; days are whole
 * days since 1970-01-01 (UTC), indices point into the tables of the same file and -1 means "none".
 */

export const fileVersion = 1;

export const matchesUrl: string =
  import.meta.env.VITE_TOURNAMENT_MATCHES_URL ??
  "https://fulllifegames.com/Tools/TournamentTeams/Matches/";

export interface FormatEntry {
  id: string;
  name: string;
  games: number;
  matches: number;
  lastDay: number;
}

export interface IndexFile {
  v: number;
  generated: string;
  formats: FormatEntry[];
}

export type ThreadRow = [
  id: number,
  round: string,
  day: number,
  matches: number,
  matchesWithGames: number,
];

export interface TournamentEntry {
  id: string;
  name: string;
  category: number;
  year: number | null;
  forum: string | null;
  games: number;
  formats: [format: number, games: number][];
  threads: ThreadRow[];
}

export interface TournamentsFile {
  v: number;
  categories: string[];
  formats: string[];
  tournaments: TournamentEntry[];
}

export type PlayerRow = [
  key: string,
  name: string,
  alts: string[],
  formats: [format: number, games: number][],
];

export interface PlayersFile {
  v: number;
  formats: string[];
  players: PlayerRow[];
}

export type PokemonRow = [
  species: number,
  item: number,
  ability: number,
  tera: number,
  moves: number[],
  lead: number,
  otherNames?: number[],
];

export type GameRow = [
  replayId: string,
  format: number,
  uploadTime: number,
  alt1: string,
  alt2: string,
  winner: number,
  team1: number,
  team2: number,
  sideOfPlayerA: number,
  views: number,
  rating: number,
];

export type MatchRow = [
  thread: number,
  playerA: number,
  playerB: number,
  winner: number,
  day: number,
  games: number[],
];

/** Matches/Formats/<format id>.json and Matches/Tournaments/<tournament id>.json. */
export interface MatchesFile {
  v: number;
  formats: string[];
  players: [key: string, name: string][];
  species: string[];
  items: string[];
  abilities: string[];
  teras: string[];
  moves: string[];
  teams: PokemonRow[][];
  games: GameRow[];
  matches: MatchRow[];
}

const requests = new Map<string, Promise<unknown>>();

/** Fetches a file of Matches/ once per visit; a failed request is forgotten, so the next call tries again. */
export const fetchFile = <T extends { v: number }>(
  path: string,
): Promise<T> => {
  const known = requests.get(path);
  if (known) {
    return known as Promise<T>;
  }
  const request = (async () => {
    const response = await fetch(matchesUrl + path);
    if (!response.ok) {
      throw new Error(`${path} answered with ${response.status}`);
    }
    const file = (await response.json()) as T;
    if (file.v !== fileVersion) {
      throw new Error(
        `${path} has version ${file.v}, this page reads version ${fileVersion}: reload the page`,
      );
    }
    return file;
  })();
  requests.set(path, request);
  request.catch(() => requests.delete(path));
  return request;
};

export const loadIndex = () => fetchFile<IndexFile>("index.json");

export const loadTournaments = () =>
  fetchFile<TournamentsFile>("tournaments.json");

export const loadPlayers = () => fetchFile<PlayersFile>("players.json");

export const loadFormat = (id: string) =>
  fetchFile<MatchesFile>(`Formats/${encodeURIComponent(id)}.json`);

export const loadTournament = (id: string) =>
  fetchFile<MatchesFile>(`Tournaments/${encodeURIComponent(id)}.json`);
