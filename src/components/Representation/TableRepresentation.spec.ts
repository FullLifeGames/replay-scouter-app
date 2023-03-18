import { mount } from "@vue/test-utils";
import TableRepresentation from "./TableRepresentation.vue";

describe("TableRepresentation.vue", () => {
  const dummyTeams = [
    {
      pokemon: [{ name: "pikachu" }, { name: "charmander" }],
    },
    {
      pokemon: [{ name: "squirtle" }, { name: "bulbasaur" }],
    },
  ];

  it("renders MonTable component", () => {
    const wrapper = mount(TableRepresentation, {
      props: {
        scoutingResult: null,
        teams: dummyTeams,
      },
    });

    expect(wrapper.findComponent({ name: "MonTable" })).toBeTruthy();
  });
});
