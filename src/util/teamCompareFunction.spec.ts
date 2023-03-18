import { useTeamCompareFunction } from "./teamCompareFunction";
import type { SortOptions } from "../types/sortOptions";
import type { Team } from "@/api";
import { ref } from "vue";

describe("useTeamCompareFunction", () => {
  it("should sort by number of replays", () => {
    const sortOptions: SortOptions[] = [
      "Number of Replays (Desc)",
      "Date (Desc)",
    ];
    const teams: Team[] = [
      {
        replays: [
          {
            uploadTime: new Date("2022-01-01").getTime(),
          },
          {
            uploadTime: new Date("2022-01-02").getTime(),
          },
        ],
      },
      {
        replays: [
          {
            uploadTime: new Date("2022-01-03").getTime(),
          },
        ],
      },
    ];

    const sortedTeamIds = [1, 0].sort(
      useTeamCompareFunction(ref(sortOptions)).value(teams)
    );

    expect(sortedTeamIds).toEqual([0, 1]);
  });

  it("should sort by date (desc)", () => {
    const sortOptions: SortOptions[] = [
      "Date (Desc)",
      "Number of Replays (Desc)",
    ];
    const teams: Team[] = [
      {
        replays: [
          {
            uploadTime: new Date("2022-01-01").getTime(),
          },
          {
            uploadTime: new Date("2022-01-02").getTime(),
          },
        ],
      },
      {
        replays: [
          {
            uploadTime: new Date("2022-01-03").getTime(),
          },
        ],
      },
    ];

    const sortedTeamIds = [1, 0].sort(
      useTeamCompareFunction(ref(sortOptions)).value(teams)
    );

    expect(sortedTeamIds).toEqual([1, 0]);
  });

  it("should sort by date (asc)", () => {
    const sortOptions: SortOptions[] = [
      "Date (Asc)",
      "Number of Replays (Desc)",
    ];
    const teams: Team[] = [
      {
        replays: [
          {
            uploadTime: new Date("2022-01-01").getTime(),
          },
          {
            uploadTime: new Date("2022-01-02").getTime(),
          },
        ],
      },
      {
        replays: [
          {
            uploadTime: new Date("2022-01-03").getTime(),
          },
        ],
      },
    ];

    const sortedTeamIds = [1, 0].sort(
      useTeamCompareFunction(ref(sortOptions)).value(teams)
    );

    expect(sortedTeamIds).toEqual([0, 1]);
  });
});
