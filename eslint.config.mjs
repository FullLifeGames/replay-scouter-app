import unicorn from "eslint-plugin-unicorn";
import globals from "globals";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default [
  {
    ignores: [
      "**/node_modules",
      "**/build",
      "**/coverage",
      "**/auto-imports.d.ts",
      "**/components.d.ts",
      "**/dist",
      "**/public",
      "**/*.js",
    ],
  },
  ...compat.extends(
    "eslint:recommended",
    "plugin:unicorn/recommended",
    "plugin:vue/vue3-recommended",
    "@vue/eslint-config-typescript/recommended",
    "@vue/eslint-config-prettier",
    "./.eslintrc-auto-import.json",
  ),
  {
    plugins: {
      unicorn,
    },

    languageOptions: {
      globals: {
        ...globals.node,
      },

      ecmaVersion: 2022,
      sourceType: "module",
    },

    rules: {
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "unicorn/no-null": "off",
      "unicorn/filename-case": "off",

      "unicorn/prevent-abbreviations": [
        "error",
        {
          checkFilenames: false,
        },
      ],

      "unicorn/no-abusive-eslint-disable": "off",
    },
  },
];
