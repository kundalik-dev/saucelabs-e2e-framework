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
  },
  eslintConfigPrettier,
];
