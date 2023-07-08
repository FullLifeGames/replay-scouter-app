import type { Team } from "@/api";
import type { StatsDict } from "@/types/stats";

export const header = `+ ---- + ------------------ + ---- + ------- + ------- +
| Rank | Pokemon            | Use  | Usage % |  Win %  |
+ ---- + ------------------ + ---- + ------- + ------- +`;

export const defaultNumberOfSpacesPerEntry = [4, 18, 4, 7, 7];
export const alignmentOfEntry = ["l", "l", "r", "r", "r"];

export const formatRegardingIndex = (
  entry: string,
  index: number,
  numberOfSpacesPerEntry = defaultNumberOfSpacesPerEntry,
) => {
  const numberOfSpaces = numberOfSpacesPerEntry[index - 1];
  const alignment = alignmentOfEntry[index - 1];
  let formattedEntry = entry;
  if (alignment === "l") {
    formattedEntry = formattedEntry.padEnd(numberOfSpaces);
  } else {
    formattedEntry = formattedEntry.padStart(numberOfSpaces);
  }
  return formattedEntry;
};

export const formatPercentage = (num: number) => {
  return (Math.round(num * 10000) / 100).toFixed(2) + "%";
};

export const getNumberOfBattles = (teams: Team[]) => {
  return teams.reduce((previous: number, team: Team) => {
    const currentTeamReplays = team.replays?.length;
    return previous + (!currentTeamReplays ? 0 : currentTeamReplays);
  }, 0);
};

export const renderUsageDict = (
  dict: StatsDict,
  teams: Team[],
  label = "Pokemon",
) => {
  const numberOfSpacesPerEntry = [...defaultNumberOfSpacesPerEntry];
  const maxEntityNameLength = Math.max(
    ...Object.keys(dict).map((entry) => entry.length),
  );
  const maxLength = Math.max(label.length, maxEntityNameLength);
  if (maxLength > numberOfSpacesPerEntry[1]) {
    numberOfSpacesPerEntry[1] = maxLength;
  }
  let output = header
    .replaceAll(
      "------------------",
      "-".padEnd(numberOfSpacesPerEntry[1], "-"),
    )
    .replace("Pokemon           ", label.padEnd(numberOfSpacesPerEntry[1]));
  const numberOfBattles = getNumberOfBattles(teams);

  const pokemonList = Object.entries(dict).map((entry) => {
    return {
      pokemon: entry[0],
      use: entry[1].use,
      wins: entry[1].wins,
      wonGames: entry[1].wonGames,
    };
  });
  pokemonList.sort((a, b) => b.use - a.use);

  let rank = 1;
  for (const pokemonEntry of pokemonList) {
    if (numberOfBattles !== 0 && pokemonEntry.use !== 0) {
      let line = "\n| " + formatRegardingIndex(rank + "", 1) + " | ";
      line +=
        formatRegardingIndex(pokemonEntry.pokemon, 2, numberOfSpacesPerEntry) +
        " | ";
      line += formatRegardingIndex(pokemonEntry.use + "", 3) + " | ";
      line +=
        formatRegardingIndex(
          formatPercentage(pokemonEntry.use / numberOfBattles),
          4,
        ) + " | ";
      line +=
        formatRegardingIndex(
          formatPercentage(pokemonEntry.wins / pokemonEntry.wonGames),
          5,
        ) + " |";

      output += line;
      rank++;
    }
  }
  return output;
};
