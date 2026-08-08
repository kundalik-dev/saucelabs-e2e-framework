# Industry-Grade UI Automation Framework Structure (Reference)

> **Purpose**: This document is a **reference blueprint** for what a mature, production-grade Playwright + JavaScript POM framework looks like at scale. It is intentionally more complete than the current state of this repo (see `CLAUDE.md` for what's actually implemented today). Use it as a target architecture to grow into incrementally — not a checklist to build all at once.

---

## 1. Guiding Principles

1. **Separation of concerns** — tests never touch locators/selectors directly; only page objects and fixtures do.
2. **Data-driven, not hardcoded** — test data lives outside spec files (JSON/fixtures/factories), so specs stay readable.
3. **Composable via fixtures** — Playwright's fixture system wires up page objects, auth state, and test data automatically instead of manual instantiation in every `beforeEach`.
4. **Fast feedback, tiered execution** — smoke → regression → full suite, tagged and runnable independently.
5. **Environment-agnostic** — the same suite runs against dev/staging/prod by swapping config, not code.
6. **CI-first** — every convention (reporting, retries, artifacts, exit codes) is designed to work headless in a pipeline, not just on a dev machine.
7. **Self-documenting** — folder names and file naming conventions communicate intent without needing a README dive.

---

## 2. Full Directory Structure

```
project-root/
├── .github/
│   └── workflows/
│       ├── pr-smoke.yml              # fast checks on every PR
│       ├── nightly-regression.yml    # full suite, scheduled
│       └── release-gate.yml          # full suite + reports before deploy
│
├── config/
│   ├── environments/
│   │   ├── dev.env
│   │   ├── qa.env
│   │   ├── staging.env
│   │   └── prod.env
│   ├── playwright.base.config.js     # shared defaults
│   ├── playwright.dev.config.js
│   ├── playwright.staging.config.js
│   └── playwright.ci.config.js
│
├── docs/
│   ├── frameworks/
│   │   └── 01-frameworks.md          # (this file)
│   ├── test-cases/                   # numbered per-page test case specs
│   │   ├── 01-login-page.md
│   │   └── 02-products-page.md
│   ├── adr/                          # Architecture Decision Records
│   │   └── 0001-use-pom-over-screenplay.md
│   └── onboarding.md                 # new SDET setup guide
│
├── fixtures/
│   ├── base.fixture.js               # extends Playwright's `test` with page objects
│   ├── auth.fixture.js               # injects storageState / logged-in session
│   ├── api.fixture.js                # request-context fixture for hybrid UI+API setup/teardown
│   └── test-data.fixture.js          # injects data-factory instances per test
│
├── pom/
│   ├── base/
│   │   └── BasePage.js               # common waits, nav, toast/alert helpers all pages inherit
│   ├── components/                   # reusable widgets shared across pages
│   │   ├── HeaderComponent.js
│   │   ├── FooterComponent.js
│   │   ├── CartBadgeComponent.js
│   │   └── ModalComponent.js
│   └── pages/
│       ├── LoginPage.js
│       ├── ProductsPage.js
│       ├── ProductDetailsPage.js
│       ├── CartPage.js
│       └── CheckoutPage.js
│
├── test-data/
│   ├── static/                       # plain JSON fixtures (current convention)
│   │   ├── loginPage-data.json
│   │   ├── productsPage-data.json
│   │   └── productsList-data.json
│   ├── factories/                    # programmatic/randomized data builders
│   │   ├── userFactory.js
│   │   └── checkoutFactory.js
│   └── schemas/                      # JSON Schema for API/response validation
│       └── product.schema.json
│
├── tests/
│   ├── e2e/
│   │   ├── login/
│   │   │   └── LoginPageTest.spec.js
│   │   ├── products/
│   │   │   └── productsTest.spec.js
│   │   ├── cart/
│   │   └── checkout/
│   ├── api/                          # pure API tests (Playwright request context)
│   │   └── inventory.api.spec.js
│   ├── visual/                       # screenshot/visual regression specs
│   │   └── products.visual.spec.js
│   └── accessibility/                # axe-core driven a11y specs
│       └── login.a11y.spec.js
│
├── utils/
│   ├── logger.js                     # centralized logging (pino/winston wrapper)
│   ├── waitHelpers.js                # custom explicit-wait utilities
│   ├── stringHelpers.js
│   ├── dateHelpers.js
│   ├── apiClient.js                  # thin wrapper over Playwright's request fixture
│   └── env.js                        # reads/validates env vars, exposes typed config object
│
├── reporters/
│   └── custom-teams-reporter.js      # optional custom Playwright reporter (Slack/Teams webhook on failure)
│
├── storage-state/                    # gitignored — generated authenticated sessions
│   └── .gitkeep
│
├── .auth-setup/
│   └── global.setup.js               # Playwright `globalSetup`: logs in once, saves storageState
│
├── docker/
│   ├── Dockerfile
│   └── docker-compose.ci.yml
│
├── .env.example                      # documents required env vars, no real secrets
├── .gitignore
├── .eslintrc.json
├── .prettierrc
├── playwright.config.js              # root config, imports from /config
├── package.json
├── pnpm-lock.yaml
└── README.md
```

---

## 3. Layer-by-Layer Breakdown

### 3.1 `pom/` — Page Object Model

- **`base/BasePage.js`**: every page object extends this. Holds shared behavior: `waitForPageLoad()`, `getToastMessage()`, `scrollToElement()`, generic `clickAndWait()`. Prevents copy-pasted boilerplate across 20+ page objects.
- **`components/`**: for UI fragments that appear on multiple pages (header, footer, cart badge, modals). A `ProductsPage` and `CartPage` can both compose `HeaderComponent` instead of duplicating its locators.
- **`pages/`**: one file per page, same convention already in place in this repo (`class LoginPage`, locators suffixed `Loc`, grouped by UI region, action methods like `validLogin()`).

### 3.2 `fixtures/` — Playwright Fixture Composition

Instead of every spec doing:

```js
test.beforeEach(async ({ page }) => {
  loginPage = new LoginPage(page);
  productsPage = new ProductsPage(page);
});
```

A `base.fixture.js` extends Playwright's `test`:

```js
export const test = base.extend({
  loginPage: async ({ page }, use) => use(new LoginPage(page)),
  productsPage: async ({ page }, use) => use(new ProductsPage(page)),
  cartPage: async ({ page }, use) => use(new CartPage(page)),
});
export { expect } from "@playwright/test";
```

Specs then just destructure `{ loginPage, productsPage }` as test arguments — no manual instantiation, and adding a new page object doesn't touch every spec file.

### 3.3 `auth.fixture.js` + `storage-state/` — Skip Repeated Logins

- `.auth-setup/global.setup.js` runs once via Playwright's `globalSetup`/`storageState` project dependency: logs in through the UI, saves `storage-state/standard-user.json`.
- Any spec that doesn't test login itself declares `test.use({ storageState: "storage-state/standard-user.json" })` (or a dedicated fixture) and starts already authenticated — cutting redundant UI login steps from every non-login test.
- `storage-state/` is gitignored; regenerated per environment/run.

### 3.4 `test-data/` — Three Tiers

1. **`static/`** — the current JSON convention (`<pageName>-data.json`, `<pageName>List-data.json`). Good for fixed, expected UI strings.
2. **`factories/`** — for data that needs to vary per test run (e.g., unique checkout info, randomized quantities) without hardcoding, avoiding test pollution when tests run in parallel.
3. **`schemas/`** — JSON Schema definitions used to validate API response shapes in `tests/api/`, catching contract drift independent of UI assertions.

### 3.5 `tests/` — Suite Segmentation

- **`e2e/`** subfolders mirror feature areas (login, products, cart, checkout) instead of one flat folder — scales better past ~10 spec files.
- **`api/`** — pure backend/API checks using Playwright's `request` fixture, run independently of the browser for speed (useful for seeding/verifying state without UI).
- **`visual/`** — `expect(page).toHaveScreenshot()` regression specs, isolated so flaky visual diffs don't block functional CI gates.
- **`accessibility/`** — `@axe-core/playwright` scans per page, tagged so they can be run/reported separately from functional coverage.
- **Tagging convention** (already partly in place): `@smoke`, `@regression`, `@critical` embedded in test titles or via Playwright's `tag` option, enabling `--grep @smoke` fast pipelines.

### 3.6 `config/` — Environment Matrix

- `playwright.base.config.js` holds shared settings (testIdAttribute, reporter, trace policy).
- Per-environment configs (`playwright.dev.config.js`, `.staging.config.js`, `.ci.config.js`) override just `baseURL`, `workers`, `retries`, `headless` and spread the base config — avoids one config file accumulating conditional spaghetti.
- `config/environments/*.env` files hold environment-specific variables (base URLs, seeded test user creds via secrets manager/CI secrets — never committed in plaintext).

### 3.7 `utils/`

- **`env.js`**: single source of truth reading `process.env`, validating required vars are present, exporting a typed/frozen config object — everything else imports from here rather than reading `process.env` ad hoc.
- **`logger.js`**: structured logging so CI failures have timestamped, leveled output instead of scattered `console.log`.
- **`apiClient.js`**: wraps Playwright's `request` context for reuse between `tests/api/` specs and any UI test that needs API-based setup/teardown (e.g., seeding a cart via API instead of clicking through the UI).

### 3.8 CI/CD (`.github/workflows/` or Jenkins equivalent)

Per `CLAUDE.md`, this project will use **Jenkins**. Equivalent pipeline stages regardless of runner:

1. **PR gate**: `pnpm install --frozen-lockfile` → `pnpm exec playwright test --grep @smoke` → publish HTML report as build artifact.
2. **Nightly regression**: full suite across enabled browser projects, retries enabled, results archived + Slack/Teams notification on failure (via `reporters/custom-teams-reporter.js`).
3. **Release gate**: full suite + visual + accessibility specs, blocking merge/deploy on failure.

A `Jenkinsfile` would live at the repo root and call the same `pnpm exec playwright test ...` commands documented in `CLAUDE.md`, just orchestrated by Jenkins stages instead of GitHub Actions YAML.

### 3.9 Reporting & Artifacts

- `reporter: "html"` (current) stays for local debugging (`pnpm run report`).
- Add `["junit", { outputFile: "results/junit.xml" }]` and `["json", { outputFile: "results/results.json" }]` alongside HTML for CI systems (Jenkins JUnit plugin, dashboards) that need machine-readable formats — configure as an array of reporters, not a replacement.
- Traces/screenshots/videos on failure (`trace: "on-first-retry"`, `screenshot: "only-on-failure"`, `video: "retain-on-failure"`) archived as CI build artifacts for post-mortem debugging without re-running locally.

### 3.10 Docker (optional, for consistent CI execution)

- `docker/Dockerfile` based on `mcr.microsoft.com/playwright:<version>` image ensures browser versions match between dev machines and CI, eliminating "works on my machine" flakiness.
- `docker-compose.ci.yml` orchestrates the test container against a target environment for fully isolated pipeline runs.

---

## 4. Naming Conventions Recap (kept consistent with current repo)

| Layer            | Convention                                                         | Example                                                    |
| ---------------- | ------------------------------------------------------------------ | ---------------------------------------------------------- |
| Page objects     | `<PageName>.js` exporting `class <PageName>`                       | `ProductsPage.js` → `class ProductsPage`                   |
| Locators         | suffixed `Loc`                                                     | `usernameLoc`, `productSortLoc`                            |
| Static test data | `<pageName>-data.json` / `<pageName>List-data.json`                | `loginPage-data.json`                                      |
| Test case docs   | numbered, `verify_<what>_<condition>`                              | `01-login-page.md` → `verify_login_with_valid_credentials` |
| Spec files       | `<Feature>Test.spec.js`                                            | `LoginPageTest.spec.js`                                    |
| Tags             | `@smoke`, `@regression`, `@critical` in test title or `tag` option | `test("... @smoke", ...)`                                  |

---

## 5. Incremental Adoption Path for This Repo

Given the current state (`pom/LoginPage.js`, `pom/ProductsPage.js`, flat `tests/`, flat `test-data/`), a realistic growth order:

1. Add `pom/base/BasePage.js` once a second/third page object shares repeated logic (waits, toasts).
2. Introduce `fixtures/base.fixture.js` when the number of page objects instantiated per spec grows past 2–3.
3. Add `.auth-setup/global.setup.js` + `storage-state/` once tests beyond login need a pre-authenticated session (already flagged as a planned addition in `CLAUDE.md`).
4. Split `tests/` into `e2e/<feature>/` subfolders once spec count exceeds ~6–8 files.
5. Add `tests/api/`, `tests/visual/`, `tests/accessibility/` only when those testing types are actually needed — don't scaffold empty folders speculatively.
6. Wire up Jenkins pipeline stages mirroring section 3.8 once CI is being configured.

This keeps the framework's actual footprint matched to real test coverage rather than over-engineering structure ahead of need.
