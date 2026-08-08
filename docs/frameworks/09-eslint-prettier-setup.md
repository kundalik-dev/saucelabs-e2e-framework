# Phase 1: ESLint + Prettier Setup (2026-07-22)

> **Purpose**: Documents how Phase 1 of the roadmap in `08-framework-assessment.md` was implemented — adding a lint/format gate, fixing the dead code it surfaced, and correcting `package.json` hygiene. Read this if you need to know _why_ a config choice was made or _what broke_ during setup, not just what the final config looks like (the configs themselves are the source of truth for current state).

---

## What Phase 1 asked for

From `08-framework-assessment.md`:

1. Add ESLint + Prettier, wire a `pnpm lint` script into CI.
2. Fix/remove the `productSearch` dead code in `inventory.page.js`.
3. Add `engines` to `package.json`, fix the `test` script to use the local Playwright bin via pnpm.

## 1. ESLint

**Packages added** (devDependencies): `eslint`, `@eslint/js`, `eslint-plugin-playwright`, `eslint-config-prettier`, `globals`.

**Config file**: `eslint.config.mjs` at the repo root (flat config — ESLint 10 no longer supports the legacy `.eslintrc` format).

```js
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
      globals: { ...globals.node },
    },
  },
  { files: ["tests/**/*.spec.js"], ...playwright.configs["flat/recommended"] },
  eslintConfigPrettier, // must be last: turns off stylistic rules that fight Prettier
];
```

Key decisions:

- **`eslint-plugin-playwright`'s `flat/recommended`** is scoped only to `tests/**/*.spec.js` — page objects and test-data files aren't Playwright test files, so Playwright-specific rules (e.g. `no-conditional-in-test`) don't apply to them.
- **`eslint-config-prettier` goes last** in the array so it can disable any formatting-related rules that would otherwise conflict with Prettier's own formatting.
- **Named `eslint.config.mjs`, not `.js`**: ESLint loads its config directly through Node (not through Playwright's esbuild-based test transform), and this repo's `package.json` has no `"type": "module"` field. Loading a `.js` file with `import`/`export` syntax under Node's default CommonJS mode triggers a `MODULE_TYPELESS_PACKAGE_JSON` warning and a slower re-parse. The `.mjs` extension tells Node directly "this file is ESM" without touching `package.json` at all.

### Why not just add `"type": "module"` to package.json?

This was tried first and **reverted** — it broke the actual test run:

```
TypeError: Module ".../test-data/inventory-data.json" needs an import attribute of "type: json"
```

With `"type": "module"` set, Node's native ESM loader takes over JSON imports (`import data from "./x.json"`) and requires an explicit `with { type: "json" }` import attribute — which Playwright's test-file loader doesn't add. Renaming just the ESLint config to `.mjs` gets the same warning-free result without that blast radius. **Do not re-add `"type": "module"` to `package.json`** without also updating every JSON import in `tests/**` and `pages/**` to use import attributes, and confirming Playwright's loader supports that combination.

## 2. Prettier

**Packages added**: `prettier`.

**Files**: `.prettierrc.json` (double quotes off → `"singleQuote": false` to match the existing codebase style, `semi: true`, `printWidth: 80`), `.prettierignore` (excludes `node_modules`, `playwright-report`, `test-results`, `visual-baselines`, `pnpm-lock.yaml`, `docs/archive`).

Running `pnpm format` once reformatted ~25 pre-existing files (markdown tables, JS files) to establish a consistent baseline — this is expected the first time Prettier is introduced to an existing repo and is a one-time cost, not something to repeat per-PR.

## 3. `package.json` changes

```diff
- "description": "",
+ "description": "E2E UI test automation framework for saucedemo.com using Playwright Test and the Page Object Model.",
+ "engines": { "node": ">=18.0.0" },
  "scripts": {
-   "test": "npx playwright test",
-   "report": "npx playwright show-report"
+   "test": "playwright test",
+   "report": "playwright show-report",
+   "lint": "eslint .",
+   "lint:fix": "eslint . --fix",
+   "format": "prettier --write .",
+   "format:check": "prettier --check ."
  },
```

- `npx playwright test` → `playwright test`: `pnpm run <script>` already puts the local `node_modules/.bin` on `PATH`, so `npx` (which does its own resolution/download-if-missing dance) was redundant and inconsistent with the project's "pnpm only" convention.
- `engines.node` pins the minimum supported Node version (Playwright 1.61 requires Node 18+); this doesn't block installs by itself but documents the floor and lets tooling (e.g. `engine-strict` in `.npmrc`, CI matrix checks) enforce it later if desired.

## 4. Dead code removed

`pages/inventory.page.js` had an incomplete `productSearch` method (flagged in `CLAUDE.md`'s Project Status table as "do not call it"). Since nothing in the codebase called it, it was deleted outright rather than fixed — `searchProductAddToCart` / `getProductCartButton` already cover the "find a product row and act on it" need it was reaching for.

## 5. Real bugs the lint pass caught

Turning on ESLint against the existing codebase (before touching anything else) surfaced actual defects, not just style nits:

| File                         | Issue                                                                                                                                                                                                                            | Fix                                                                                                               |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `test-data/footer-data.js`   | `export default footerData = { copyrightText = "...", ... }` — invalid syntax (`=` instead of `:` in an object literal, and exporting an identifier being assigned inline isn't valid JS). This file would throw at import time. | Rewrote as `const footerData = { copyrightText: "...", socialLinksTextArray: [...] }; export default footerData;` |
| `tests/ui/auth.ui.spec.js`   | Imported `credentials` from `auth-data.js` but never used it (`no-unused-vars`)                                                                                                                                                  | Removed the unused import                                                                                         |
| `tests/e2e/auth.e2e.spec.js` | Three tests destructured `{ page }` as a test arg without using it; one test destructured `expectedError` without asserting it                                                                                                   | Removed the unused params/bindings                                                                                |
| `tests/e2e/auth.e2e.spec.js` | `await page.url()` — `page.url()` is synchronous, the `await` was a no-op (`playwright/no-useless-await`)                                                                                                                        | Removed the unnecessary `await`                                                                                   |
| `tests/e2e/auth.e2e.spec.js` | `expect(...).not.toBeVisible()` (`playwright/no-useless-not`)                                                                                                                                                                    | Changed to `expect(...).toBeHidden()`                                                                             |

All fixes were mechanical (unused bindings, a genuine syntax error, a redundant `await`/negated matcher) — no test behavior changed; `pnpm run test` was re-run after each fix and all 5 existing tests still pass.

## 6. CI wiring

`.github/workflows/playwright.yml` gained a new `lint` job that runs `pnpm run lint` and `pnpm run format:check`, and the existing `test` job now declares `needs: lint` — so a lint/format failure fails fast without paying for a Playwright browser install, and the test job only runs once lint is green.

```yaml
jobs:
  lint:
    timeout-minutes: 10
    steps:
      [checkout, setup-node, pnpm install, pnpm run lint, pnpm run format:check]

  test:
    needs: lint
    # ...unchanged...
```

## Result

- `pnpm run lint` — exits 0, no errors/warnings.
- `pnpm run format:check` — exits 0, "All matched files use Prettier code style!".
- `pnpm run test` — all 5 existing tests still pass.
- CI now gates on lint + format before running the browser suite.

Phase 1 from `08-framework-assessment.md` is complete. Next up is Phase 2 (`global-setup.js` + `storageState`, a `base.fixture.js` for auto-wiring page objects) — see that document for the full roadmap.
