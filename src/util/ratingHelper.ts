import type { Pokemon, Team } from "@/api";
import { Dex } from "@pkmn/dex";
import { Generations } from "@pkmn/data";
import { calculate, Pokemon as RealPokemon, Move, toID } from "@smogon/calc";
import type { Generation } from "@smogon/calc/dist/data/interface";

export const toRealPokemon = (
  p: Pokemon,
  gen: Generation,
): RealPokemon | null => {
  let realPokemon = null;
  try {
    realPokemon = new RealPokemon(gen, p.name!, {
      item: p.item!,
      nature: p.nature,
      ability: p.ability!,
      evs: p.evs,
      ivs: p.ivs,
      moves: p.moves,
    });
  } catch {
    console.log("Error with " + p.name);
  }
  return realPokemon;
};

export const getGeneration = (generation: number): Generation => {
  const gens = new Generations(Dex);
  const gen = gens.get(generation) as Generation;
  return gen;
};

export const rateTeam = (
  team: Team,
  realOtherPokemon: RealPokemon[],
  gen: Generation,
): number => {
  const beatList = Array.from({ length: realOtherPokemon.length }).map(
    (x) => false,
  );

  if (!team.pokemon) {
    return 0;
  }

  const realPokemon: RealPokemon[] = team.pokemon
    .map((p) => toRealPokemon(p, gen))
    .filter((x) => x !== null) as RealPokemon[];

  for (const mon of realPokemon) {
    if (!mon.moves) {
      continue;
    }
    for (const [index, otherMon] of realOtherPokemon.entries()) {
      if (!otherMon.moves) {
        continue;
      }
      if (!beatList[index]) {
        beatList[index] = doesMonWinAgainstOther(mon, otherMon, gen);
      }
    }
  }

  if (realOtherPokemon.length === 0) {
    return 0;
  }
  return beatList.filter((x) => x === true).length / realOtherPokemon.length;
};

export const calculateAverage = (
  mon: RealPokemon,
  otherMon: RealPokemon,
  gen: Generation,
): number => {
  let bestMoveAverage = 0;
  for (const move of mon.moves) {
    const item = gen.items.get(toID(otherMon.item));
    // Skip invalid items
    if (item === undefined) {
      continue;
    }
    const result = calculate(gen, mon, otherMon, new Move(gen, move));
    const ranges = result.range();
    const average = (ranges[0] + ranges[1]) / 2;
    if (average > bestMoveAverage) {
      bestMoveAverage = average;
    }
  }
  return bestMoveAverage;
};

export const doesMonWinAgainstOther = (
  mon: RealPokemon,
  otherMon: RealPokemon,
  gen: Generation,
): boolean => {
  const bestMoveAverage = calculateAverage(mon, otherMon, gen);
  const bestOtherMoveAverage = calculateAverage(otherMon, mon, gen);

  const faster = mon.stats.spe > otherMon.stats.spe;

  const hpFactorMine = bestMoveAverage / otherMon.stats.hp;
  const hpFactorOther = bestOtherMoveAverage / mon.stats.hp;

  const numberOfTurns =
    hpFactorMine === 0 ? Number.MAX_VALUE : 1 / hpFactorMine;
  const numberOfOtherTurns =
    hpFactorOther === 0 ? Number.MAX_VALUE : 1 / hpFactorOther;

  if (numberOfTurns < numberOfOtherTurns) {
    return true;
  } else if (numberOfOtherTurns < numberOfTurns) {
    return false;
  }

  if (faster) {
    return true;
  }

  return false;
};
