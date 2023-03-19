import { mount } from "@vue/test-utils";
import ScoutingResult from "./ListRepresentation.vue";
import type { ApiScoutingResult, Team } from "@/api";
import { getFormatFromTeam } from "@/util/teamCompareFunction";

const mockTeams: Team[] = [
  {
    replays: [
      {
        id: "123456",
        p1: "Player1",
        p2: "Player2",
        format: "gen8ou",
        log: "some log",
        uploadTime: 1632683037,
        views: 100,
        p1Id: "player1",
        p2Id: "player2",
        formatId: "gen8ou",
        rating: 1500,
        _private: 0,
        password: "",
        winner: "Player1",
        winForTeam: true,
        playerInfo: {
          playerName: "Player1",
          playerValue: "p1",
        },
        link: "https://replay.pokemonshowdown.com/gen8ou-123456",
      },
    ],
    pokemon: [
      {
        name: "Pikachu",
        formName: null,
        altNames: [],
        ability: "Static",
        item: "Light Ball",
        teraType: null,
        lead: true,
        moves: ["Thunderbolt", "Volt Switch", "Hidden Power Ice", "Grass Knot"],
      },
      {
        name: "Charizard",
        formName: null,
        altNames: [],
        ability: "Blaze",
        item: "Charizardite X",
        teraType: null,
        lead: false,
        moves: ["Flare Blitz", "Dragon Claw", "Roost", "Earthquake"],
      },
    ],
    format: "gen8ou",
  },
];

const mockScoutingResult: ApiScoutingResult = {
  outputs: {
    header: "Test Scouting Result",
    teams: [],
  },
  teams: mockTeams,
};

describe("ScoutingResult.vue", () => {
  it("renders the correct header", () => {
    const wrapper = mount(ScoutingResult, {
      props: {
        scoutingResult: mockScoutingResult,
        teams: mockTeams,
      },
    });
    expect(wrapper.find("h4").text()).toBe(mockScoutingResult.outputs?.header);
  });

  it("renders the correct number of teams", () => {
    const wrapper = mount(ScoutingResult, {
      props: {
        scoutingResult: mockScoutingResult,
        teams: mockTeams,
      },
    });
    const teamList = wrapper.findAll(".list-group-item");
    expect(teamList.length).toBe(mockTeams.length * 2);
  });

  it("renders the correct team format", () => {
    const wrapper = mount(ScoutingResult, {
      props: {
        scoutingResult: mockScoutingResult,
        teams: mockTeams,
      },
    });
    const teamFormat = wrapper.findAll("h5");
    mockTeams.forEach((team, index) => {
      const format = getFormatFromTeam(team);
      expect(teamFormat[index].text()).toContain(format);
    });
  });

  it("renders the correct number of replays", () => {
    const wrapper = mount(ScoutingResult, {
      props: {
        scoutingResult: mockScoutingResult,
        teams: mockTeams,
      },
    });
    const replayCollapses = wrapper.findAll(".collapse");
    mockTeams.forEach((team, index) => {
      expect(replayCollapses[index].findAll(".list-group-item").length).toBe(
        team.replays?.length
      );
    });
  });
});
