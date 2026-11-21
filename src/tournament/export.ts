/**
 * What the page hands out as text: the statistics tables and the Teams, in the formats the Classic
 * view writes, so that what people paste elsewhere keeps its shape.
 */
import type { Team as ApiTeam } from "@/api";
import {
  defaultNumberOfSpacesPerEntry,
  formatPercentage,
  formatRegardingIndex,
  header,
} from "@/util/statisticFormatting";
import { teamToText } from "@/util/textHelper";
import { replayUrl } from "./model";
import type { TeamUse } from "./query";
import { share, type Table } from "./statistics";

/**
 * The table as the Classic view's text: rank, entry, uses, share of all sides and win rate. `limit`
 * cuts it after that many rows.
 */
export const usageText = (
  table: Table,
  label = "Pokemon",
  limit = Number.POSITIVE_INFINITY,
) => {
  const widths = [...defaultNumberOfSpacesPerEntry];
  let longest = label.length;
  for (const row of table.rows) {
    longest = Math.max(longest, row.key.length);
  }
  widths[1] = Math.max(widths[1], longest);
  const lines = [
    header
      .replaceAll("------------------", "-".padEnd(widths[1], "-"))
      .replace("Pokemon           ", label.padEnd(widths[1])),
  ];
  let rank = 1;
  for (const row of table.rows) {
    if (rank > limit) {
      break;
    }
    if (table.total === 0 || row.use === 0) {
      continue;
    }
    lines.push(
      `| ${formatRegardingIndex(`${rank}`, 1)} | ` +
        `${formatRegardingIndex(row.key, 2, widths)} | ` +
        `${formatRegardingIndex(`${row.use}`, 3)} | ` +
        `${formatRegardingIndex(formatPercentage(share(row.use, table.total)), 4)} | ` +
        `${formatRegardingIndex(formatPercentage(share(row.wins, row.decided)), 5)} |`,
    );
    rank++;
  }
  return lines.join("\n");
};

/** The table as the Classic view's CSV download. */
export const usageCsv = (table: Table) => {
  const lines = ["Pokemon;Use;Usage %;Win %"];
  for (const row of table.rows) {
    if (table.total === 0 || row.use === 0) {
      continue;
    }
    lines.push(
      `${row.key};${row.use};${formatPercentage(share(row.use, table.total))};` +
        formatPercentage(share(row.wins, row.decided)),
    );
  }
  return lines.join("\n");
};

/**
 * A Team of a search in the shape the Scouter returns Teams in, with its Games as replays: what the
 * Classic view's text, JSON and "Fill Build" work on.
 */
export const toApiTeam = (
  use: TeamUse,
  formatName: (id: string) => string,
): ApiTeam => ({
  pokemon: use.team.pokemon.map((mon) => ({
    name: mon.name,
    altNames: mon.otherNames.length > 0 ? [...mon.otherNames] : undefined,
    ability: mon.ability,
    item: mon.item,
    teraType: mon.tera,
    lead: mon.lead,
    moves: [...mon.moves],
  })),
  replays: use.sides.map((side) => {
    const [first, second] = side.game.sides;
    const winner = side.game.sides.find((entry) => entry.won);
    return {
      id: side.game.id,
      link: replayUrl(side.game.id),
      format: formatName(side.game.format),
      formatId: side.game.format,
      uploadTime: side.game.time,
      views: side.game.views,
      rating: side.game.rating || null,
      p1: first.alt,
      p2: second.alt,
      players: [first.alt, second.alt],
      winner: winner ? winner.alt : null,
      winForTeam: side.won,
      playerInfo: {
        playerName: side.alt,
        playerValue: side === first ? "p1" : "p2",
      },
    };
  }),
  format: use.sides.length > 0 ? formatName(use.sides[0].game.format) : null,
});

/** The Teams as the Classic view's text: a heading, then each Team with its replay links and Sets. */
export const teamsText = (heading: string, teams: ApiTeam[]) =>
  `${heading}\n\n${teams.map((team) => teamToText(team)).join("\n\n\n")}`;

/** The Teams as the Classic view's JSON. */
export const teamsJson = (teams: ApiTeam[]) => JSON.stringify(teams);
