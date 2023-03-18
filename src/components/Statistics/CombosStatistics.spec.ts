// tests/unit/CombosStatistics.spec.ts
import { mount } from "@vue/test-utils";
import CombosStatistics from "./CombosStatistics.vue";
import type { Team, ApiScoutingResult } from "../../api";

describe("CombosStatistics.vue", () => {
  const mockScoutingResult: ApiScoutingResult = {
    teams: [],
    outputs: null,
  };

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

  it("calculates statistics correctly", () => {
    const wrapper = mount(CombosStatistics, {
      props: {
        scoutingResult: mockScoutingResult,
        showLeads: true,
        teams: mockTeams,
      },
    });

    const expectedStatistics = `+ ---- + --------------------------- + ---- + ------- + ------- +
| Rank | Combos of 2                 | Use  | Usage % |  Win %  |
+ ---- + --------------------------- + ---- + ------- + ------- +
| 1    | (Lead) Pikachu / Charizard  |    2 |  33.33% |  50.00% |
| 2    | (Lead) Pikachu / Toxicroak  |    2 |  33.33% |  50.00% |
| 3    | Charizard / Toxicroak       |    2 |  33.33% |  50.00% |
| 4    | (Lead) Pikachu / Groudon    |    2 |  33.33% |  50.00% |
| 5    | Charizard / Groudon         |    2 |  33.33% |  50.00% |
| 6    | Toxicroak / Groudon         |    2 |  33.33% |  50.00% |
| 7    | (Lead) Pikachu / Espeon     |    2 |  33.33% |  50.00% |
| 8    | Charizard / Espeon          |    2 |  33.33% |  50.00% |
| 9    | Toxicroak / Espeon          |    2 |  33.33% |  50.00% |
| 10   | Groudon / Espeon            |    2 |  33.33% |  50.00% |
| 11   | (Lead) Pikachu / Jolteon    |    2 |  33.33% |  50.00% |
| 12   | Charizard / Jolteon         |    2 |  33.33% |  50.00% |
| 13   | Toxicroak / Jolteon         |    2 |  33.33% |  50.00% |
| 14   | Groudon / Jolteon           |    2 |  33.33% |  50.00% |
| 15   | Espeon / Jolteon            |    2 |  33.33% |  50.00% |
| 16   | (Lead) Blastoise / Venusaur |    2 |  33.33% |  50.00% |
| 17   | (Lead) Blastoise / Alakazam |    2 |  33.33% |  50.00% |
| 18   | Venusaur / Alakazam         |    2 |  33.33% |  50.00% |
| 19   | (Lead) Gengar / Machamp     |    2 |  33.33% | 100.00% |
| 20   | (Lead) Gengar / Golem       |    2 |  33.33% | 100.00% |
| 21   | Machamp / Golem             |    2 |  33.33% | 100.00% |
| 22   | (Lead) Gengar / Jolteon     |    2 |  33.33% | 100.00% |
| 23   | Machamp / Jolteon           |    2 |  33.33% | 100.00% |
| 24   | Golem / Jolteon             |    2 |  33.33% | 100.00% |
| 25   | (Lead) Gengar / Alakazam    |    2 |  33.33% | 100.00% |
| 26   | Machamp / Alakazam          |    2 |  33.33% | 100.00% |
| 27   | Golem / Alakazam            |    2 |  33.33% | 100.00% |
| 28   | Jolteon / Alakazam          |    2 |  33.33% | 100.00% |
| 29   | (Lead) Gengar / Arcanine    |    2 |  33.33% | 100.00% |
| 30   | Machamp / Arcanine          |    2 |  33.33% | 100.00% |
| 31   | Golem / Arcanine            |    2 |  33.33% | 100.00% |
| 32   | Jolteon / Arcanine          |    2 |  33.33% | 100.00% |
| 33   | Alakazam / Arcanine         |    2 |  33.33% | 100.00% |

+ ---- + -------------------------------------- + ---- + ------- + ------- +
| Rank | Combos of 3                            | Use  | Usage % |  Win %  |
+ ---- + -------------------------------------- + ---- + ------- + ------- +
| 1    | (Lead) Pikachu / Charizard / Toxicroak |    2 |  33.33% |  50.00% |
| 2    | (Lead) Pikachu / Charizard / Groudon   |    2 |  33.33% |  50.00% |
| 3    | (Lead) Pikachu / Toxicroak / Groudon   |    2 |  33.33% |  50.00% |
| 4    | Charizard / Toxicroak / Groudon        |    2 |  33.33% |  50.00% |
| 5    | (Lead) Pikachu / Charizard / Espeon    |    2 |  33.33% |  50.00% |
| 6    | (Lead) Pikachu / Toxicroak / Espeon    |    2 |  33.33% |  50.00% |
| 7    | Charizard / Toxicroak / Espeon         |    2 |  33.33% |  50.00% |
| 8    | (Lead) Pikachu / Groudon / Espeon      |    2 |  33.33% |  50.00% |
| 9    | Charizard / Groudon / Espeon           |    2 |  33.33% |  50.00% |
| 10   | Toxicroak / Groudon / Espeon           |    2 |  33.33% |  50.00% |
| 11   | (Lead) Pikachu / Charizard / Jolteon   |    2 |  33.33% |  50.00% |
| 12   | (Lead) Pikachu / Toxicroak / Jolteon   |    2 |  33.33% |  50.00% |
| 13   | Charizard / Toxicroak / Jolteon        |    2 |  33.33% |  50.00% |
| 14   | (Lead) Pikachu / Groudon / Jolteon     |    2 |  33.33% |  50.00% |
| 15   | Charizard / Groudon / Jolteon          |    2 |  33.33% |  50.00% |
| 16   | Toxicroak / Groudon / Jolteon          |    2 |  33.33% |  50.00% |
| 17   | (Lead) Pikachu / Espeon / Jolteon      |    2 |  33.33% |  50.00% |
| 18   | Charizard / Espeon / Jolteon           |    2 |  33.33% |  50.00% |
| 19   | Toxicroak / Espeon / Jolteon           |    2 |  33.33% |  50.00% |
| 20   | Groudon / Espeon / Jolteon             |    2 |  33.33% |  50.00% |
| 21   | (Lead) Blastoise / Venusaur / Alakazam |    2 |  33.33% |  50.00% |
| 22   | (Lead) Gengar / Machamp / Golem        |    2 |  33.33% | 100.00% |
| 23   | (Lead) Gengar / Machamp / Jolteon      |    2 |  33.33% | 100.00% |
| 24   | (Lead) Gengar / Golem / Jolteon        |    2 |  33.33% | 100.00% |
| 25   | Machamp / Golem / Jolteon              |    2 |  33.33% | 100.00% |
| 26   | (Lead) Gengar / Machamp / Alakazam     |    2 |  33.33% | 100.00% |
| 27   | (Lead) Gengar / Golem / Alakazam       |    2 |  33.33% | 100.00% |
| 28   | Machamp / Golem / Alakazam             |    2 |  33.33% | 100.00% |
| 29   | (Lead) Gengar / Jolteon / Alakazam     |    2 |  33.33% | 100.00% |
| 30   | Machamp / Jolteon / Alakazam           |    2 |  33.33% | 100.00% |
| 31   | Golem / Jolteon / Alakazam             |    2 |  33.33% | 100.00% |
| 32   | (Lead) Gengar / Machamp / Arcanine     |    2 |  33.33% | 100.00% |
| 33   | (Lead) Gengar / Golem / Arcanine       |    2 |  33.33% | 100.00% |
| 34   | Machamp / Golem / Arcanine             |    2 |  33.33% | 100.00% |
| 35   | (Lead) Gengar / Jolteon / Arcanine     |    2 |  33.33% | 100.00% |
| 36   | Machamp / Jolteon / Arcanine           |    2 |  33.33% | 100.00% |
| 37   | Golem / Jolteon / Arcanine             |    2 |  33.33% | 100.00% |
| 38   | (Lead) Gengar / Alakazam / Arcanine    |    2 |  33.33% | 100.00% |
| 39   | Machamp / Alakazam / Arcanine          |    2 |  33.33% | 100.00% |
| 40   | Golem / Alakazam / Arcanine            |    2 |  33.33% | 100.00% |
| 41   | Jolteon / Alakazam / Arcanine          |    2 |  33.33% | 100.00% |

+ ---- + ------------------------------------------------ + ---- + ------- + ------- +
| Rank | Combos of 4                                      | Use  | Usage % |  Win %  |
+ ---- + ------------------------------------------------ + ---- + ------- + ------- +
| 1    | (Lead) Pikachu / Charizard / Toxicroak / Groudon |    2 |  33.33% |  50.00% |
| 2    | (Lead) Pikachu / Charizard / Toxicroak / Espeon  |    2 |  33.33% |  50.00% |
| 3    | (Lead) Pikachu / Charizard / Groudon / Espeon    |    2 |  33.33% |  50.00% |
| 4    | (Lead) Pikachu / Toxicroak / Groudon / Espeon    |    2 |  33.33% |  50.00% |
| 5    | Charizard / Toxicroak / Groudon / Espeon         |    2 |  33.33% |  50.00% |
| 6    | (Lead) Pikachu / Charizard / Toxicroak / Jolteon |    2 |  33.33% |  50.00% |
| 7    | (Lead) Pikachu / Charizard / Groudon / Jolteon   |    2 |  33.33% |  50.00% |
| 8    | (Lead) Pikachu / Toxicroak / Groudon / Jolteon   |    2 |  33.33% |  50.00% |
| 9    | Charizard / Toxicroak / Groudon / Jolteon        |    2 |  33.33% |  50.00% |
| 10   | (Lead) Pikachu / Charizard / Espeon / Jolteon    |    2 |  33.33% |  50.00% |
| 11   | (Lead) Pikachu / Toxicroak / Espeon / Jolteon    |    2 |  33.33% |  50.00% |
| 12   | Charizard / Toxicroak / Espeon / Jolteon         |    2 |  33.33% |  50.00% |
| 13   | (Lead) Pikachu / Groudon / Espeon / Jolteon      |    2 |  33.33% |  50.00% |
| 14   | Charizard / Groudon / Espeon / Jolteon           |    2 |  33.33% |  50.00% |
| 15   | Toxicroak / Groudon / Espeon / Jolteon           |    2 |  33.33% |  50.00% |
| 16   | (Lead) Gengar / Machamp / Golem / Jolteon        |    2 |  33.33% | 100.00% |
| 17   | (Lead) Gengar / Machamp / Golem / Alakazam       |    2 |  33.33% | 100.00% |
| 18   | (Lead) Gengar / Machamp / Jolteon / Alakazam     |    2 |  33.33% | 100.00% |
| 19   | (Lead) Gengar / Golem / Jolteon / Alakazam       |    2 |  33.33% | 100.00% |
| 20   | Machamp / Golem / Jolteon / Alakazam             |    2 |  33.33% | 100.00% |
| 21   | (Lead) Gengar / Machamp / Golem / Arcanine       |    2 |  33.33% | 100.00% |
| 22   | (Lead) Gengar / Machamp / Jolteon / Arcanine     |    2 |  33.33% | 100.00% |
| 23   | (Lead) Gengar / Golem / Jolteon / Arcanine       |    2 |  33.33% | 100.00% |
| 24   | Machamp / Golem / Jolteon / Arcanine             |    2 |  33.33% | 100.00% |
| 25   | (Lead) Gengar / Machamp / Alakazam / Arcanine    |    2 |  33.33% | 100.00% |
| 26   | (Lead) Gengar / Golem / Alakazam / Arcanine      |    2 |  33.33% | 100.00% |
| 27   | Machamp / Golem / Alakazam / Arcanine            |    2 |  33.33% | 100.00% |
| 28   | (Lead) Gengar / Jolteon / Alakazam / Arcanine    |    2 |  33.33% | 100.00% |
| 29   | Machamp / Jolteon / Alakazam / Arcanine          |    2 |  33.33% | 100.00% |
| 30   | Golem / Jolteon / Alakazam / Arcanine            |    2 |  33.33% | 100.00% |

+ ---- + ---------------------------------------------------------- + ---- + ------- + ------- +
| Rank | Combos of 5                                                | Use  | Usage % |  Win %  |
+ ---- + ---------------------------------------------------------- + ---- + ------- + ------- +
| 1    | (Lead) Pikachu / Charizard / Toxicroak / Groudon / Espeon  |    2 |  33.33% |  50.00% |
| 2    | (Lead) Pikachu / Charizard / Toxicroak / Groudon / Jolteon |    2 |  33.33% |  50.00% |
| 3    | (Lead) Pikachu / Charizard / Toxicroak / Espeon / Jolteon  |    2 |  33.33% |  50.00% |
| 4    | (Lead) Pikachu / Charizard / Groudon / Espeon / Jolteon    |    2 |  33.33% |  50.00% |
| 5    | (Lead) Pikachu / Toxicroak / Groudon / Espeon / Jolteon    |    2 |  33.33% |  50.00% |
| 6    | Charizard / Toxicroak / Groudon / Espeon / Jolteon         |    2 |  33.33% |  50.00% |
| 7    | (Lead) Gengar / Machamp / Golem / Jolteon / Alakazam       |    2 |  33.33% | 100.00% |
| 8    | (Lead) Gengar / Machamp / Golem / Jolteon / Arcanine       |    2 |  33.33% | 100.00% |
| 9    | (Lead) Gengar / Machamp / Golem / Alakazam / Arcanine      |    2 |  33.33% | 100.00% |
| 10   | (Lead) Gengar / Machamp / Jolteon / Alakazam / Arcanine    |    2 |  33.33% | 100.00% |
| 11   | (Lead) Gengar / Golem / Jolteon / Alakazam / Arcanine      |    2 |  33.33% | 100.00% |
| 12   | Machamp / Golem / Jolteon / Alakazam / Arcanine            |    2 |  33.33% | 100.00% |

+ ---- + ------------------------------------------------------------------- + ---- + ------- + ------- +
| Rank | Combos of 6                                                         | Use  | Usage % |  Win %  |
+ ---- + ------------------------------------------------------------------- + ---- + ------- + ------- +
| 1    | (Lead) Pikachu / Charizard / Toxicroak / Groudon / Espeon / Jolteon |    2 |  33.33% |  50.00% |
| 2    | (Lead) Gengar / Machamp / Golem / Jolteon / Alakazam / Arcanine     |    2 |  33.33% | 100.00% |`;

    expect(wrapper.vm.statistics).toBe(expectedStatistics);
  });
});
