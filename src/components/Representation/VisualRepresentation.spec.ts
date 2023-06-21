import { mount } from "@vue/test-utils";
import VisualRepresentation from "./VisualRepresentation.vue";
import VueDOMPurifyHTML from "vue-dompurify-html";

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

  it("renders the correct number of accordion-items", () => {
    const wrapper = mount(VisualRepresentation, {
      global: {
        plugins: [VueDOMPurifyHTML],
      },
      props: {
        scoutingResult: null,
        teams: dummyTeams,
        outputTeams: dummyOutputTeams,
      },
    });
    expect(wrapper.findAll(".accordion-item").length).toBe(dummyTeams.length);
  });
});
