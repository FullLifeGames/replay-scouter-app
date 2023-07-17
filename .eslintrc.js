module.exports = {
  root: true,
  env: {
    es2021: true,
    node: true,
  },
  ignorePatterns: ["node_modules", "build", "coverage", "auto-imports.d.ts", "components.d.ts"],
  extends: [
    "eslint:recommended",
    "plugin:vue/vue3-recommended",
    "@vue/eslint-config-typescript/recommended",
    "@vue/eslint-config-prettier",
    './.eslintrc-auto-import.json',
  ],
  parserOptions: {
    ecmaVersion: 2020,
  },
  rules: {
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": "off"
  }
};
