import type { Pokemon, Team } from "@/api";

export const findMostSimilarPokemon = (
  mon: Pokemon,
  otherPokemon: Pokemon[],
): [Pokemon | null, number] => {
  let closestMon: Pokemon | null = null;
  let closestSimilarities = 0;
  for (const otherMon of otherPokemon) {
    if (
      otherMon.name === mon.name &&
      otherMon.moves &&
      otherMon.moves.length === 4
    ) {
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

  return [closestMon, closestSimilarities];
};

export const findMostSimilarPokemonWithTeams = (
  mon: Pokemon,
  teams: Team[],
): Pokemon | null => {
  let closestMon: Pokemon | null = null;
  let closestSimilarities = 0;
  for (const otherTeam of teams) {
    if (!otherTeam.pokemon) {
      continue;
    }
    const [otherClosestMon, otherClosestSimilarities] = findMostSimilarPokemon(
      mon,
      otherTeam.pokemon,
    );
    if (otherClosestSimilarities > closestSimilarities) {
      closestMon = otherClosestMon;
      closestSimilarities = otherClosestSimilarities;
    }
  }

  return closestMon;
};

export const adaptWithClosestMon = (
  mon: Pokemon,
  closestMon: Pokemon,
): void => {
  if (!mon.ability) {
    mon.ability = closestMon.ability;
  }
  if (!mon.item) {
    mon.item = closestMon.item;
  }
  if (!mon.teraType) {
    mon.teraType = closestMon.teraType;
  }
  if (!mon.evs) {
    mon.evs = closestMon.evs;
  }
  if (!mon.ivs) {
    mon.ivs = closestMon.ivs;
  }
  if (!mon.nature) {
    mon.nature = closestMon.nature;
  }
  if (mon.moves === undefined) {
    mon.moves = [];
  }

  if (mon.moves.length < 4 && closestMon.moves) {
    for (const otherMove of closestMon.moves) {
      if (mon.moves.length < 4 && !mon.moves.includes(otherMove)) {
        mon.moves.push(otherMove);
      }
    }
  }
};
