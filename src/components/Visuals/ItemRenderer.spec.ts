import { mount } from "@vue/test-utils";
import ItemRenderer from "./ItemRenderer.vue";

describe("ItemRenderer.vue", () => {
  it("renders the correct item for a given name", () => {
    const name = "Leftovers";
    const wrapper = mount(ItemRenderer, {
      props: {
        name,
      },
    });
    expect(wrapper.html()).toContain("background: ");
  });

  it("does not render anything if no name is provided", () => {
    const wrapper = mount(ItemRenderer, {
      props: {
        name: null,
      },
    });
    expect(wrapper.html()).not.toContain("background: ");
  });
});
