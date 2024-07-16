import path from "node:path";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import Components from "unplugin-vue-components/vite";
import Icons from "unplugin-icons/vite";
import IconsResolver from "unplugin-icons/resolver";
import AutoImport from "unplugin-auto-import/vite";

import { BootstrapVueNextResolver } from "bootstrap-vue-next";

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
          "@pkmn/sim": ["@pkmn/sim"],
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
