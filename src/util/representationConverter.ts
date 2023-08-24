import type { Pokemon } from "@/api";
import { Sets } from "@pkmn/sets";

export const teamStringToPokemon = (teamString: string): Pokemon[] => {
  const teams: Pokemon[] = [];
  let first = true;
  for (const rawMon of teamString.split("\n\n")) {
    const mon = rawMon.trim();
    if (mon !== "") {
      const set = Sets.importSet(mon);
      if (set) {
        teams.push({
          ability: set.ability,
          altNames: set.name ? [set.name] : undefined,
          name: set.species,
          item: set.item,
          moves: set.moves ?? [],
          nature: set.nature,
          evs: set.evs,
          ivs: set.ivs,
          lead: first,
          teraType: set.teraType,
        });
        first = false;
      } else {
        console.error(`Issue with: \n${mon}`);
      }
    }
  }
  return teams;
};
