import { mount } from "@vue/test-utils";
import SearchQuery from "src/components/Visuals/SearchQuery.vue";
import { BootstrapVueNext } from "bootstrap-vue-next";

describe("SearchQuery.vue", () => {
  test("renders the component", () => {
    const wrapper = mount(SearchQuery, {
      global: {
        plugins: [BootstrapVueNext],
      },
      props: { scoutingResult: {} },
    });
    expect(wrapper.exists()).toBe(true);
  });

  test('adds a search query when the "add" button is clicked', async () => {
    const wrapper = mount(SearchQuery, {
      global: {
        plugins: [BootstrapVueNext],
      },
      props: {
        multiple: true,
        scoutingResult: {},
      },
    });
    const addButton = wrapper.find(".queryButton");

    expect(wrapper.vm.searchQueries.length).toBe(1);

    await addButton.trigger("click");

    expect(wrapper.vm.searchQueries.length).toBe(2);
  });

  test('deletes a search query when the "delete" button is clicked', async () => {
    const wrapper = mount(SearchQuery, {
      global: {
        plugins: [BootstrapVueNext],
      },
      props: {
        multiple: true,
        scoutingResult: {},
      },
    });
    const addButton = wrapper.find(".queryButton");
    await addButton.trigger("click");
    expect(wrapper.vm.searchQueries.length).toBe(2);

    const deleteButton = wrapper.findAll(".queryButton").at(1);

    expect(deleteButton).toBeDefined();
    if (deleteButton) {
      await deleteButton.trigger("click");

      expect(wrapper.vm.searchQueries.length).toBe(1);
    }
  });

  test('emits the "change" event when the SortInput component changes', async () => {
    const wrapper = mount(SearchQuery, {
      global: {
        plugins: [BootstrapVueNext],
      },
      props: { scoutingResult: {} },
    });
    const sortInput = wrapper.findComponent({ name: "SortInput" });

    const providedChange = ["Date (Asc)"];

    await sortInput.vm.$emit("change", providedChange);

    expect(wrapper.vm.sortOptions).toEqual(providedChange);
  });
});
