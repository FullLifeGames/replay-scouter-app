import { mount } from "@vue/test-utils";
import { ApiScoutingResult, ScoutApi } from "@/api";
import ScouterSearchMask from "./ScouterSearchMask.vue";
import { createRouter, createWebHistory } from "vue-router";
import { routes } from "@/router";
import useEmitter from "@/plugins/emitter";

describe("SearchSearchMask.vue", () => {
  let wrapper = mount(ScouterSearchMask, {
    global: {
      plugins: [
        createRouter({
          history: createWebHistory(),
          routes: routes,
        }),
      ],
    },
  });

  beforeEach(() => {
    const vueConfig = {
      global: {
        plugins: [
          createRouter({
            history: createWebHistory(),
            routes: routes,
          }),
        ],
      },
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (vueConfig.global as any).config = {
      globalProperties: {
        emitter: useEmitter(),
      },
    };
    wrapper = mount(ScouterSearchMask, vueConfig);
  });

  afterEach(() => {
    wrapper.unmount();
  });

  test("disables the scout button when no input is provided", () => {
    const scoutButton = wrapper.find("#scoutButton");
    expect(scoutButton.attributes("disabled")).toBe("");
  });

  test("enables the scout button when input is provided", async () => {
    const nameInput = wrapper.find("#name-input input");
    await nameInput.setValue(["user1"]);
    const scoutButton = wrapper.find("#scoutButton");
    expect(scoutButton.attributes("disabled")).toBeFalsy();
  });

  test("calls the scout function and sets the links properly", async () => {
    const mockScoutingResult: ApiScoutingResult = {
      teams: [],
      outputs: {
        header: "test",
        teams: [],
      },
    };

    const scoutApiSpy = vitest
      .spyOn(ScoutApi.prototype, "scoutPost")
      .mockResolvedValue(mockScoutingResult);

    const nameInput = wrapper.find("#name-input input");
    await nameInput.setValue(["user1"]);

    const scoutButton = wrapper.find("#scoutButton");
    await scoutButton.trigger("click");

    expect(scoutApiSpy).toHaveBeenCalled();
    expect(wrapper.emitted().scouting.length).toBe(1);
    expect(wrapper.emitted().scouting[0]).toEqual([mockScoutingResult]);

    scoutApiSpy.mockRestore();
  });

  test("sets the links correctly when input changes", async () => {
    const replaysInput = wrapper.find("#replays-input");
    await replaysInput.setValue("https://replay1.com\nhttps://replay2.com");

    expect(wrapper.vm.links).toBe("https://replay1.com\nhttps://replay2.com");
    expect(wrapper.vm.scoutGetRequest.links).toEqual([
      "https://replay1.com",
      "https://replay2.com",
    ]);
  });

  wrapper.unmount();
});
