import { mount } from "@vue/test-utils";
import VisualRepresentation from "./VisualRepresentation.vue";

describe("VisualRepresentation.vue", () => {
  const dummyTeams = [
    {
      pokemon: [{ name: "pikachu" }, { name: "charmander" }],
    },
    {
      pokemon: [{ name: "squirtle" }, { name: "bulbasaur" }],
    },
  ];

  const dummyOutputTeams = ["Team1", "Team2"];

  it("renders the correct number of b-cards", () => {
    const wrapper = mount(VisualRepresentation, {
      props: {
        scoutingResult: null,
        teams: dummyTeams,
        outputTeams: dummyOutputTeams,
      },
    });
    expect(wrapper.findAll(".card").length).toBe(dummyTeams.length);
  });

  it("collapses and expands b-cards when header is clicked", async () => {
    const wrapper = mount(VisualRepresentation, {
      props: {
        scoutingResult: null,
        teams: dummyTeams,
        outputTeams: dummyOutputTeams,
      },
    });

    const cardHeaders = wrapper.findAll(".card-header");
    await cardHeaders[0].trigger("click");
    expect(wrapper.vm.collapseVisible[0]).toBe(true);

    await cardHeaders[0].trigger("click");
    expect(wrapper.vm.collapseVisible[0]).toBe(false);
  });
});
