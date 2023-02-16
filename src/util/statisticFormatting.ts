import type { Team } from "@/api";

export const header = `+ ---- + ------------------ + ---- + ------- + ------- +
| Rank | Pokemon            | Use  | Usage % |  Win %  |
+ ---- + ------------------ + ---- + ------- + ------- +`;

export const numberOfSpacesPerEntry = [4, 18, 4, 7, 7];
export const alignmentOfEntry = ["l", "l", "r", "r", "r"];

export const formatRegardingIndex = (entry: string, index: number) => {
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
  dict: { [entity: string]: { use: number; wins: number } },
  teams: Team[],
  label = "Pokemon"
) => {
  let output = header.replace("Pokemon           ", label.padEnd(18));
  const numberOfBattles = getNumberOfBattles(teams);

  const pokemonList = Object.entries(dict).map((entry) => {
    return { pokemon: entry[0], use: entry[1].use, wins: entry[1].wins };
  });
  pokemonList.sort((a, b) => b.use - a.use);

  let rank = 1;
  for (const pokemonEntry of pokemonList) {
    if (numberOfBattles !== 0 && pokemonEntry.use !== 0) {
      let line = "\n| " + formatRegardingIndex(rank + "", 1) + " | ";
      line += formatRegardingIndex(pokemonEntry.pokemon, 2) + " | ";
      line += formatRegardingIndex(pokemonEntry.use + "", 3) + " | ";
      line +=
        formatRegardingIndex(
          formatPercentage(pokemonEntry.use / numberOfBattles),
          4
        ) + " | ";
      line +=
        formatRegardingIndex(
          formatPercentage(pokemonEntry.wins / pokemonEntry.use),
          5
        ) + " |";

      output += line;
      rank++;
    }
  }
  return output;
};
