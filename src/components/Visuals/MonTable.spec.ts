import { mount } from "@vue/test-utils";
import MonTable from "./MonTable.vue";
import { Species } from "@pkmn/dex";

describe("MonTable.vue", () => {
  const dummySpecies: Species[][] = [
    [{ name: "Pikachu" } as Species, { name: "Charmander" } as Species],
    [{ name: "Squirtle" } as Species, { name: "Bulbasaur" } as Species],
  ];

  it("renders the correct number of table rows", () => {
    const wrapper = mount(MonTable, {
      props: {
        scoutingResult: null,
        species: dummySpecies,
      },
    });

    const rows = wrapper.findAll("tbody > tr");
    const maxLength = Math.max(...dummySpecies.map((entry) => entry.length));
    expect(rows.length).toBe(maxLength);
  });

  it("renders the correct number of table columns", () => {
    const wrapper = mount(MonTable, {
      props: {
        scoutingResult: null,
        species: dummySpecies,
      },
    });

    const columns = wrapper.findAll("thead > tr > th");
    expect(columns.length).toBe(dummySpecies.length);
  });

  it("renders the correct species name in table cells", () => {
    const wrapper = mount(MonTable, {
      props: {
        scoutingResult: null,
        species: dummySpecies,
      },
    });

    const cells = wrapper.findAll("tbody > tr > td");
    const speciesNames = [
      dummySpecies[0][0],
      dummySpecies[1][0],
      dummySpecies[0][1],
      dummySpecies[1][1],
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
        species: dummySpecies,
      },
    });

    const spritesRendererComponents = wrapper.findAllComponents({
      name: "SpritesRenderer",
    });
    expect(spritesRendererComponents.length).toBeGreaterThan(0);
  });
});
