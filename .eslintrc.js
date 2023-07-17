module.exports = {
  root: true,
  env: {
    es2024: true,
    node: true,
  },
  ignorePatterns: ["node_modules", "build", "coverage", "auto-imports.d.ts", "components.d.ts"],
  plugins: [
    "unicorn"
  ],
  extends: [
    "eslint:recommended",
    "plugin:unicorn/recommended",
    "plugin:vue/vue3-recommended",
    "@vue/eslint-config-typescript/recommended",
    "@vue/eslint-config-prettier",
    './.eslintrc-auto-import.json',
  ],
  parserOptions: {
    ecmaVersion: "latest",
    "sourceType": "module"
  },
  rules: {
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": "off",
    "unicorn/no-null": "off",
    "unicorn/filename-case": "off",
    "unicorn/prevent-abbreviations": [
      "error",
      {
        "checkFilenames": false
      }
    ],
    "unicorn/no-abusive-eslint-disable": "off"
  }
};
