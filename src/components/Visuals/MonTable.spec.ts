import { mount } from "@vue/test-utils";
import MonTable from "./MonTable.vue";
import type { Team } from "@/api";

describe("MonTable.vue", () => {
  const mockTeams: Team[] = [
    {
      replays: [
        {
          id: "1",
          p1: "Player1",
          p2: "Player2",
          format: "gen8",
          winForTeam: true,
          winner: "Player1",
        },
        {
          id: "2",
          p1: "Player1",
          p2: "Player3",
          format: "gen8",
          winForTeam: false,
          winner: "Player3",
        },
      ],
      pokemon: [
        { name: "Pikachu", lead: true, moves: ["Thunderbolt", "Quick Attack"] },
        { name: "Charizard", lead: false, moves: ["Flamethrower", "Fly"] },
        { name: "Toxicroak", lead: false, moves: ["Gunk Shot"] },
        { name: "Groudon", lead: false, moves: ["Earthquake"] },
        { name: "Espeon", lead: false, moves: ["Psychic", "Quick Attack"] },
        { name: "Jolteon", lead: false, moves: ["Thunderbolt", "Volt Switch"] },
      ],
      format: "gen8",
    },
    {
      replays: [
        {
          id: "3",
          p1: "Player1",
          p2: "Player2",
          format: "gen8",
          winForTeam: true,
          winner: "Player1",
        },
        {
          id: "4",
          p1: "Player1",
          p2: "Player3",
          format: "gen8",
          winForTeam: false,
          winner: "Player3",
        },
      ],
      pokemon: [
        { name: "Blastoise", lead: true, moves: ["Surf", "Ice Beam"] },
        { name: "Venusaur", lead: false, moves: ["Razor Leaf", "Sludge Bomb"] },
        { name: "Alakazam", lead: false, moves: ["Psychic", "Shadow Ball"] },
      ],
      format: "gen8",
    },
    {
      replays: [
        {
          id: "5",
          p1: "Player1",
          p2: "Player2",
          format: "gen8",
          winForTeam: true,
          winner: "Player1",
        },
        {
          id: "6",
          p1: "Player1",
          p2: "Player3",
          format: "gen8",
          winForTeam: true,
          winner: "Player3",
        },
      ],
      pokemon: [
        { name: "Gengar", lead: true, moves: ["Shadow Ball", "Sludge Wave"] },
        {
          name: "Machamp",
          lead: false,
          moves: ["Dynamic Punch", "Earthquake"],
        },
        { name: "Golem", lead: false, moves: ["Rock Slide", "Earthquake"] },
        { name: "Jolteon", lead: false, moves: ["Thunderbolt", "Volt Switch"] },
        {
          name: "Alakazam",
          lead: false,
          moves: ["Psychic", "Shadow Ball", "Calm Mind"],
        },
        {
          name: "Arcanine",
          lead: false,
          moves: ["Flare Blitz", "Wild Charge", "Extreme Speed"],
        },
      ],
      format: "gen8",
    },
  ];

  it("renders the correct number of table rows", () => {
    const wrapper = mount(MonTable, {
      props: {
        scoutingResult: null,
        teams: mockTeams,
      },
    });

    const rows = wrapper.findAll("tbody > tr");
    const maxLength = Math.max(
      ...mockTeams.map((entry) => entry.pokemon?.length ?? 0),
    );
    expect(rows.length).toBe(maxLength);
  });

  it("renders the correct number of table columns", () => {
    const wrapper = mount(MonTable, {
      props: {
        scoutingResult: null,
        teams: mockTeams,
      },
    });

    const columns = wrapper.findAll("thead > tr > th");
    expect(columns.length).toBe(mockTeams.length);
  });

  it("renders the correct species name in table cells", () => {
    const wrapper = mount(MonTable, {
      props: {
        scoutingResult: null,
        teams: mockTeams,
      },
    });

    const cells = wrapper.findAll("tbody > tr > td");
    const speciesNames = [
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      mockTeams[0].pokemon![0],
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      mockTeams[1].pokemon![0],
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      mockTeams[2].pokemon![0],
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      mockTeams[0].pokemon![1],
    ].map((species) => species.name);
    cells.forEach((cell, index) => {
      if (speciesNames[index]) {
        expect(cell.text()).toContain(speciesNames[index]);
      }
    });
  });

  it("renders SpritesRenderer component in table cells", () => {
    const wrapper = mount(MonTable, {
      props: {
        scoutingResult: null,
        teams: mockTeams,
      },
    });

    const spritesRendererComponents = wrapper.findAllComponents({
      name: "SpritesRenderer",
    });
    expect(spritesRendererComponents.length).toBeGreaterThan(0);
  });
});
