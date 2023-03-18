import type { Team } from "@/api";
import type { SortOptions } from "@/types/sortOptions";

export const getDateFromTeam = (team: Team) => {
  const replayDateList =
    team.replays?.map((replay) => replay.uploadTime).sort() ?? [];

  if (replayDateList.length && replayDateList[0]) {
    return replayDateList[0];
  }
  return null;
};

export const getFormatFromTeam = (team: Team) => {
  const format = team.format;
  if (format) {
    return format;
  }
  const replayFormatList =
    team.replays?.map((replay) => replay.format).sort() ?? [];

  if (replayFormatList.length && replayFormatList[0]) {
    return replayFormatList[0];
  }
  return null;
};

export const getPlayerFromTeam = (team: Team) => {
  const replayPlayerNameList =
    team.replays?.map((replay) => replay.playerInfo?.playerName).sort() ?? [];

  if (replayPlayerNameList.length && replayPlayerNameList[0]) {
    return replayPlayerNameList[0];
  }
  return null;
};

export const getRatingFromTeam = (team: Team) => {
  const replayRatingList =
    team.replays?.map((replay) => replay.rating).sort() ?? [];

  if (replayRatingList.length && replayRatingList[0]) {
    return replayRatingList[0];
  }
  return null;
};

export const getViewsFromTeam = (team: Team) => {
  const replayViewsList =
    team.replays?.map((replay) => replay.views).sort() ?? [];

  if (replayViewsList.length && replayViewsList[0]) {
    return replayViewsList[0];
  }
  return null;
};

export const useTeamCompareFunction = (sortOptions: Ref<SortOptions[]>) => {
  return computed(() => {
    const givenSortOptions = sortOptions.value;
    return (teams: Team[]) => (teamNumber1: number, teamNumber2: number) => {
      const team1 = teams[teamNumber1];
      const team2 = teams[teamNumber2];

      for (const sortOption of givenSortOptions) {
        let analyzingTeam1 = team1;
        let analyzingTeam2 = team2;
        if (sortOption.includes("(Desc)")) {
          analyzingTeam1 = team2;
          analyzingTeam2 = team1;
        }
        if (sortOption.includes("Number of Replays")) {
          const replays1 = analyzingTeam1.replays?.length ?? 0;
          const replays2 = analyzingTeam2.replays?.length ?? 0;
          const replayDiff = replays1 - replays2;
          if (replayDiff !== 0) {
            return replayDiff;
          }
        } else if (sortOption.includes("Date")) {
          const date1 = getDateFromTeam(analyzingTeam1) ?? 0;
          const date2 = getDateFromTeam(analyzingTeam2) ?? 0;
          const dateDiff = date1 - date2;
          if (dateDiff !== 0) {
            return dateDiff;
          }
        } else if (sortOption.includes("Format")) {
          const format1 = getFormatFromTeam(analyzingTeam1) ?? "";
          const format2 = getFormatFromTeam(analyzingTeam2) ?? "";
          const formatDiff = format1.localeCompare(format2);
          if (formatDiff !== 0) {
            return formatDiff;
          }
        } else if (sortOption.includes("Player")) {
          const player1Value = getPlayerFromTeam(analyzingTeam1) ?? "";
          const player2Value = getPlayerFromTeam(analyzingTeam2) ?? "";
          const playerDiff = player1Value.localeCompare(player2Value);
          if (playerDiff !== 0) {
            return playerDiff;
          }
        } else if (sortOption.includes("Rating")) {
          const ratingValue1 = getRatingFromTeam(analyzingTeam1) ?? 0;
          const ratingValue2 = getRatingFromTeam(analyzingTeam2) ?? 0;
          const ratingDiff = ratingValue1 - ratingValue2;
          if (ratingDiff !== 0) {
            return ratingDiff;
          }
        } else if (sortOption.includes("Views")) {
          const viewValue1 = getViewsFromTeam(analyzingTeam1) ?? 0;
          const viewValue2 = getViewsFromTeam(analyzingTeam2) ?? 0;
          const viewDiff = viewValue1 - viewValue2;
          if (viewDiff !== 0) {
            return viewDiff;
          }
        }
      }

      return 0;
    };
  });
};
