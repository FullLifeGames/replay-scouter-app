import type { Pokemon, Team } from "@/api";

export const findMostSimilarPokemon = (
  mon: Pokemon,
  teams: Team[],
): Pokemon | null => {
  let closestMon: Pokemon | null = null;
  let closestSimilarities = 0;
  for (const otherTeam of teams) {
    if (!otherTeam.pokemon) {
      continue;
    }
    for (const otherMon of otherTeam.pokemon) {
      if (otherMon.name === mon.name) {
        let similarities = 0;
        if (otherMon.ability === mon.ability) {
          similarities++;
        }
        if (otherMon.item === mon.item) {
          similarities++;
        }
        if (otherMon.teraType === mon.teraType) {
          similarities++;
        }
        if (otherMon.evs === mon.evs) {
          similarities++;
        }
        if (otherMon.ivs === mon.ivs) {
          similarities++;
        }
        if (otherMon.nature === mon.nature) {
          similarities++;
        }
        if (mon.moves && otherMon.moves) {
          for (const move of mon.moves) {
            if (otherMon.moves.includes(move)) {
              similarities++;
            }
          }
        }
        if (similarities > closestSimilarities) {
          closestMon = otherMon;
          closestSimilarities = similarities;
        }
      }
    }
  }

  return closestMon;
};
