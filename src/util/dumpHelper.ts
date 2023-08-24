import type { SmogonDumpResult } from "@/types/smogonDumpResult";
import { teamStringToPokemon } from "./representationConverter";
import type { Team } from "@/api";

export const retrieveSmogonDumpEntry = async (
  id: string,
): Promise<[Team[], string[]]> => {
  const result = await fetch(
    `https://fulllifegames.com/Tools/SmogonDump/Teams/${id}`,
  );
  let smogonDumpResults: SmogonDumpResult[] = await result.json();

  smogonDumpResults = smogonDumpResults.filter(
    (smogonDumpResult) =>
      teamStringToPokemon(smogonDumpResult.TeamString).length === 6,
  );

  const teams = smogonDumpResults.map((smogonDumpResult) => {
    return {
      format: smogonDumpResult.Definition,
      pokemon: teamStringToPokemon(smogonDumpResult.TeamString),
      replays: [
        {
          format: smogonDumpResult.Definition,
          formatId: smogonDumpResult.Definition,
          uploadTime: Date.parse(smogonDumpResult.PostDate) / 1000,
          link: smogonDumpResult.URL,
          id: smogonDumpResult.URL,
          rating: smogonDumpResult.Koeffizient,
          views: smogonDumpResult.Likes,
        },
      ],
    };
  });

  const outputTeams = smogonDumpResults.map(
    (element) =>
      `${element.Koeffizient} Score, ${element.Likes} Likes, posted by ${element.PostedBy}:\n${element.URL}` +
      `\n\n${element.TeamString}`,
  );

  return [teams, outputTeams];
};
