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

export const pokemonName = (mon: Pokemon): string => {
  if (mon.formName) {
    return mon.formName;
  }
  if (mon.name) {
    return mon.name;
  }
  return "";
};

export const pokemonToText = (mon: Pokemon): string => {
  let text = "";
  text += pokemonName(mon);
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
  if (mon.evs && statsTableToText(mon.evs, 0) !== "") {
    text += "EVs: " + statsTableToText(mon.evs, 0) + "\n";
  }
  if (mon.nature) {
    text += mon.nature + " Nature" + "\n";
  }
  if (mon.ivs && statsTableToText(mon.ivs, 31) !== "") {
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
    text +=
      team.pokemon
        .map((x) => (x.lead ? "(Lead) " + pokemonName(x) : pokemonName(x)))
        .sort()
        .join(", ") + ":\n";
    text += team.replays
      ? team.replays
          .map((x) => x.link)
          .sort()
          .join("\n") + "\n\n"
      : "\n";
    text += team.pokemon
      .map((x) => pokemonToText(x))
      .sort()
      .join("\n\n");
  }
  return text;
};
