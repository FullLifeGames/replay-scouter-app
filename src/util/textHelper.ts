import type { Pokemon, Team } from "@/api";
import type { StatsTable } from "@pkmn/sim";

export const statsTableToText = (
  statTable: StatsTable,
  filterNumber: number,
): string => {
  return Object.entries(statTable)
    .filter((x) => x[1] !== filterNumber)
    .map((x) => x[1] + " " + x[0])
    .join(" / ")
    .replace("hp", "HP")
    .replace("atk", "Atk")
    .replace("def", "Def")
    .replace("spa", "SpA")
    .replace("spd", "SpD")
    .replace("spe", "Spe");
};

export const pokemonToText = (mon: Pokemon): string => {
  let text = "";
  if (mon.name) {
    text += mon.name;
  }
  if (mon.item) {
    text += " @ " + mon.item;
  }
  if (mon.name || mon.item) {
    text += "\n";
  }
  if (mon.ability) {
    text += "Ability: " + mon.ability + "\n";
  }
  if (mon.teraType) {
    text += "Tera Type: " + mon.teraType + "\n";
  }
  if (mon.evs) {
    text += "EVs: " + statsTableToText(mon.evs, 0) + "\n";
  }
  if (mon.nature) {
    text += mon.nature + " Nature" + "\n";
  }
  if (mon.ivs) {
    text += "IVs: " + statsTableToText(mon.ivs, 31) + "\n";
  }
  if (mon.moves) {
    text += mon.moves.map((x) => "- " + x).join("\n");
  }

  return text;
};

export const teamToText = (team: Team): string => {
  let text = "";
  if (team.pokemon) {
    for (const mon of team.pokemon) {
      text += pokemonToText(mon) + "\n\n";
    }
  }
  return text;
};
