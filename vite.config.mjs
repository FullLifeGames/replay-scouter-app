import { readFileSync } from "node:fs";
import path from "node:path";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import Components from "unplugin-vue-components/vite";
import Icons from "unplugin-icons/vite";
import IconsResolver from "unplugin-icons/resolver";
import AutoImport from "unplugin-auto-import/vite";
import { Dex, toID } from "@pkmn/sim";

import { BootstrapVueNextResolver } from "bootstrap-vue-next";

// Mods in @pkmn/mods whose formats Showdown doesn't offer anymore
const skippedMods = new Set(["gen9dlc1"]);

// Builds the format list at build time and provides it as "virtual:formats",
// so the bundle doesn't need @pkmn/sim and all of its data just for the names.
// @pkmn/sim only bundles formats that need no mods, so the rest (like the
// Champions formats) come from every mod in @pkmn/mods that isn't skipped
const virtualFormatsId = "virtual:formats";
const formatsPlugin = () => {
  return {
    name: "formats",
    resolveId(id) {
      if (id === virtualFormatsId) {
        return `\0${virtualFormatsId}`;
      }
    },
    async load(id) {
      if (id === `\0${virtualFormatsId}`) {
        // @pkmn/mods doesn't export its package.json, so it's read from disk
        const modsPackage = JSON.parse(
          readFileSync(
            path.resolve(
              import.meta.dirname,
              "node_modules/@pkmn/mods/package.json",
            ),
            "utf8",
          ),
        );
        const mods = Object.keys(modsPackage.exports)
          .filter((subpath) => subpath !== ".")
          .map((subpath) => subpath.slice(2))
          .filter((name) => !skippedMods.has(name));
        const moddedFormats = await Promise.all(
          mods.map(async (name) => {
            const { Formats } = await import(`@pkmn/mods/${name}`);
            return Formats;
          }),
        );
        const formats = [...Dex.formats.all(), ...moddedFormats.flat()]
          // Format lists can contain section headers, which have no name
          .filter((format) => format.name)
          .map((format) => {
            return { id: toID(format.name), name: format.name };
          });
        return `export default ${JSON.stringify(formats)};`;
      }
    },
  };
};

const config = defineConfig({
  resolve: {
    alias: {
      "@": `${path.resolve(import.meta.dirname, "src")}`,
    },
  },

  build: {
    minify: true,
    rollupOptions: {
      output: {
        manualChunks: {
          "@pkmn/img": ["@pkmn/img"],
          "@pkmn/sets": ["@pkmn/sets"],
          "@smogon/calc": ["@smogon/calc"],
          "bootstrap-vue-next": ["bootstrap-vue-next"],
          "chart.js": ["chart.js"],
          "chartjs-adapter-luxon": ["chartjs-adapter-luxon"],
          dompurify: ["dompurify"],
          "fuse.js": ["fuse.js"],
          "lodash.random": ["lodash.random"],
          luxon: ["luxon"],
          "vue-chartjs": ["vue-chartjs"],
          "vue-router": ["vue-router"],
          "vue-select": ["vue-select"],
        },
      },
    },
  },

  plugins: [
    formatsPlugin(),
    vue({
      script: {
        defineModel: true,
      },
    }),
    Components({
      resolvers: [BootstrapVueNextResolver(), IconsResolver()],
      dts: "src/components.d.ts",
    }),
    Icons({
      compiler: "vue3",
      autoInstall: true,
    }),
    AutoImport({
      imports: ["vue", "vue-router", "@vueuse/core"],
      dts: "src/auto-imports.d.ts",
      eslintrc: {
        enabled: true,
      },
    }),
  ],

  server: {
    port: 3333,
    base: "./",
  },

  base: "./",

  test: {
    globals: true,
    environment: "jsdom",
    reporters: "dot",
    deps: {
      inline: ["vue"],
    },
  },
});

export default config;
