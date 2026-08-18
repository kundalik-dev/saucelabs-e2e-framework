// @ts-check
import js from "@eslint/js";
import globals from "globals";
import playwright from "eslint-plugin-playwright";
import eslintConfigPrettier from "eslint-config-prettier";

export default [
  {
    ignores: [
      "node_modules/**",
      "playwright-report/**",
      "test-results/**",
      "visual-baselines/**",
      "docs/archive/**",
      "allure-results/**",
      "allure-report/**",
    ],
  },
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.node,
      },
    },
  },
  {
    files: ["tests/**/*.spec.js"],
    ...playwright.configs["flat/recommended"],
    rules: {
      ...playwright.configs["flat/recommended"].rules,
      // Test callback params are destructured Playwright fixtures — they're often
      // requested only to trigger a fixture's side effect (e.g. `loginUser` logging
      // in) without the test body ever reading the value. Skip arg-usage checking
      // entirely in spec files so fixture names don't need an `_` prefix to stay.
      "no-unused-vars": ["error", { args: "none" }],
    },
  },
  eslintConfigPrettier,
];
