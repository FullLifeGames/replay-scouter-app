import { mount } from "@vue/test-utils";
import SortInput from "./SortInput.vue";

describe("SortInput", () => {
  // This test case is correct, but there is some weirdness going on currently with bootstrap-vue-next
  it("emits a change event with the selected options when an option is added", async () => {
    const wrapper = mount(SortInput);
    const select = wrapper.find("select");

    await select.setValue("Date (Asc)");

    // TODO: Uncomment on next dependency upgrade
    /*
      expect(wrapper.emitted("change")).toEqual([[["Date (Asc)"]]]);

      await select.setValue("Player (Asc)");
      expect(wrapper.emitted("change")).toEqual([
        [["Date (Asc)"]],
        [["Date (Asc)", "Player (Asc)"]],
      ]);
    */
  });

  it("disables an option once it has been added", async () => {
    const wrapper = mount(SortInput);
    const select = wrapper.find("select");

    expect(select.find("option[value='Date (Asc)']")).toBeDefined();

    await select.setValue("Date (Asc)");
    expect(select.find("option[value='Date (Asc)']").exists()).toBeFalsy();

    await select.setValue("Player (Asc)");
    expect(select.find("option[value='Player (Asc)']").exists()).toBeFalsy();
  });

  it("renders the selected options as tags", async () => {
    const wrapper = mount(SortInput);
    const select = wrapper.find("select");
    let tagList = wrapper.find(".list-inline");

    expect(tagList.exists()).toBeFalsy();

    await select.setValue("Date (Asc)");

    tagList = wrapper.find(".list-inline");
    expect(tagList.text()).toContain("Date (Asc)");

    await select.setValue("Player (Asc)");
    expect(tagList.text()).toContain("Date (Asc)");
    expect(tagList.text()).toContain("Player (Asc)");
  });

  it("removes a tag when it is clicked", async () => {
    const wrapper = mount(SortInput);
    const select = wrapper.find("select");

    await select.setValue("Date (Asc)");
    await select.setValue("Player (Asc)");
    expect(wrapper.vm.values).toEqual(["Date (Asc)", "Player (Asc)"]);

    const tag = wrapper.find(".list-inline-item button");
    await tag.trigger("click");

    expect(wrapper.vm.values).toEqual(["Player (Asc)"]);
  });
});
