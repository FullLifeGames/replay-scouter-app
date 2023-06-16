import { mount } from "@vue/test-utils";
import VueDOMPurifyHTML from "vue-dompurify-html";
import RepresentationsRenderer from "./RepresentationsRenderer.vue";
import TextRepresentation from "./Representation/TextRepresentation.vue";
import VisualRepresentation from "./Representation/VisualRepresentation.vue";
import type { Team } from "@/api";

describe("RepresentationsRenderer.vue", () => {
  // Test case 1: Component rendering and default state
  test("should render the component and set default state", () => {
    const wrapper = mount(RepresentationsRenderer, {
      global: {
        plugins: [VueDOMPurifyHTML],
      },
      props: { scoutingResult: {} },
    });

    // Check if the component is rendered
    expect(wrapper.exists()).toBeTruthy();

    // Check if the default representation is 'VisualRepresentation'
    expect(wrapper.vm.selectedRepresentation).toBe("VisualRepresentation");
    expect(wrapper.findComponent(VisualRepresentation).exists()).toBe(true);

    // Check if the search is visible by default
    expect(wrapper.vm.showSearch).toBe(true);
  });

  // Test case 2: Switching between different representations
  test("should switch between representations", async () => {
    const wrapper = mount(RepresentationsRenderer, {
      global: {
        plugins: [VueDOMPurifyHTML],
      },
      props: { scoutingResult: {} },
    });

    // Check the default representation
    expect(wrapper.vm.selectedRepresentation).toBe("VisualRepresentation");

    // Change the representation
    const select = wrapper.find("select");
    await select.setValue("TextRepresentation");

    // Check the new representation
    expect(wrapper.vm.selectedRepresentation).toBe("TextRepresentation");
    expect(wrapper.findComponent(TextRepresentation).exists()).toBe(true);
    expect(wrapper.findComponent(VisualRepresentation).exists()).toBe(false);
  });

  // Test case 3: Search visibility toggle
  test("should toggle search visibility", async () => {
    const wrapper = mount(RepresentationsRenderer, {
      global: {
        plugins: [VueDOMPurifyHTML],
      },
      props: { scoutingResult: {} },
    });

    // Check if the search is visible by default
    expect(wrapper.vm.showSearch).toBe(true);

    // Toggle search visibility
    await wrapper.vm.switchSearch();

    // Check if the search is hidden
    expect(wrapper.vm.showSearch).toBe(false);
  });

  // Test case 4: Change event
  test("should emit change event with updated values", async () => {
    const wrapper = mount(RepresentationsRenderer, {
      global: {
        plugins: [VueDOMPurifyHTML],
      },
      props: { scoutingResult: {} },
    });

    // Trigger the change event with mock data
    const searchedTeams: Team[] = [{}];
    const searchedOutputs = ["output1"];
    await wrapper.vm.change(searchedTeams, searchedOutputs);

    // Check if teams and outputTeams are updated
    expect(wrapper.vm.teams).toEqual(searchedTeams);
    expect(wrapper.vm.outputTeams).toEqual(searchedOutputs);
  });
});
