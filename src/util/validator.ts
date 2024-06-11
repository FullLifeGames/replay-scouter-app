import type { Team } from "@/api";

export const determineValidTeams = (
  rawSearchQueries: string[],
  team: Team,
): boolean[] => {
  if (rawSearchQueries.length === 0) {
    return [];
  }
  const validList: boolean[] = [];

  for (const rawSearchQuery of rawSearchQueries) {
    let valid = false;
    const trimmedSearchQuery = rawSearchQuery.trim().toLowerCase();
    let searchQuery = trimmedSearchQuery;
    if (searchQuery.startsWith("-")) {
      searchQuery = searchQuery.slice(1);
    }
    if (team.pokemon) {
      valid ||= team.pokemon.some((pokemon) =>
        pokemon.name?.toLowerCase().includes(searchQuery),
      );
      valid ||= team.pokemon.some((pokemon) =>
        pokemon.moves?.some((move) => move.toLowerCase().includes(searchQuery)),
      );
      valid ||= team.pokemon.some((pokemon) =>
        pokemon.ability?.toLowerCase().includes(searchQuery),
      );
      valid ||= team.pokemon.some((pokemon) =>
        pokemon.item?.toLowerCase().includes(searchQuery),
      );
      valid ||= team.pokemon.some((pokemon) =>
        pokemon.altNames?.some((altName) =>
          altName.toLowerCase().includes(searchQuery),
        ),
      );
      valid ||= team.pokemon.some((pokemon) =>
        pokemon.teraType?.toLowerCase().includes(searchQuery),
      );
      valid ||= team.pokemon.some((pokemon) =>
        pokemon.formName?.toLowerCase().includes(searchQuery),
      );
    }
    if (team.format) {
      valid ||= team.format.toLowerCase().includes(searchQuery);
    }
    if (team.replays) {
      valid ||= team.replays.some((replay) =>
        replay.playerInfo?.playerName?.toLowerCase().includes(searchQuery),
      );
      valid ||= team.replays.some((replay) =>
        replay.id?.toLowerCase().includes(searchQuery),
      );
    }
    if (trimmedSearchQuery.startsWith("-")) {
      valid = !valid;
    }
    validList.push(valid);
  }
  return validList;
};
