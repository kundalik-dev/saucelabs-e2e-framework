# 🎭 SauceDemo E2E Automation Framework

![Playwright](https://img.shields.io/badge/Playwright-1.62-2EAD33?logo=playwright&logoColor=white)
![Node](https://img.shields.io/badge/Node-LTS-339933?logo=node.js&logoColor=white)
![pnpm](https://img.shields.io/badge/pnpm-11.18-F69220?logo=pnpm&logoColor=white)
![License](https://img.shields.io/badge/License-ISC-blue.svg)

> **CI status**: no GitHub Actions workflow exists yet in this repo (no `.github/` directory) — the badge that used to live here pointed at a workflow that isn't set up. See [Roadmap](#roadmap).

An end-to-end UI test automation framework for **[saucedemo.com](https://www.saucedemo.com/)**, built with [Playwright Test](https://playwright.dev/) in JavaScript. The framework follows the **Page Object Model (POM)** and is driven by external, decoupled test data (`JSON` / `JS`), keeping test logic, page interactions, and test data cleanly separated.

---

## Table of Contents

- [🎭 SauceDemo E2E Automation Framework](#-saucedemo-e2e-automation-framework)
  - [Table of Contents](#table-of-contents)
  - [Tech Stack](#tech-stack)
  - [Project Structure](#project-structure)
  - [Prerequisites](#prerequisites)
  - [Getting Started](#getting-started)
  - [Running Tests](#running-tests)
  - [Test Reports](#test-reports)
  - [Architecture](#architecture)
    - [Page Objects](#page-objects)
    - [Tests](#tests)
    - [Fixtures](#fixtures)
    - [Utils](#utils)
    - [Test Data](#test-data)
  - [Test Case Naming Convention](#test-case-naming-convention)
  - [Coding Conventions](#coding-conventions)
  - [CI/CD](#cicd)
  - [Roadmap](#roadmap)
  - [Contributing](#contributing)
  - [License](#license)

---

## Tech Stack

| Category        | Tool                                                 |
| --------------- | ---------------------------------------------------- |
| Test Runner     | [Playwright Test](https://playwright.dev/docs/intro) |
| Language        | JavaScript (ESM)                                     |
| Design Pattern  | Page Object Model (POM)                              |
| Test Data       | JSON / JS fixtures                                   |
| Package Manager | [pnpm](https://pnpm.io/)                             |
| Linting/Format  | ESLint (flat config) + Prettier                      |
| Reporting       | Playwright HTML Reporter                             |
| CI/CD           | GitHub Actions _(planned — not set up yet)_          |
| Target App      | [saucedemo.com](https://www.saucedemo.com/)          |

---

## Project Structure

```
04-saucelabs-e2e-framework/
├── docs/
│   ├── frameworks/                # Target architecture (01-07) + implementation logs (08-11)
│   └── test-cases/                # Manual/automation test case documentation
├── fixtures/
│   └── login.fixture.js           # `loginUser` fixture — logs in as standard_user, still drives a real UI login
├── pages/                         # Page Object Model classes
│   ├── login.page.js
│   └── inventory.page.js
├── test-data/                      # Test data (JSON / JS)
│   ├── users-data.js
│   ├── inventory-data.json
│   └── inventory-sort-data.js
├── tests/
│   ├── ui/
│   │   └── login.spec.js
│   └── e2e/
│       ├── inventory.spec.js
│       └── checkout.spec.js       # empty — not started
├── utils/
│   └── common.utils.js            # CommonUtils.formatPrice(s) / .formatPrices(arr)
├── playwright-report/              # Generated HTML report (git-ignored)
├── test-results/                   # Raw test run artifacts (git-ignored)
├── eslint.config.mjs               # ESLint flat config (+ eslint-plugin-playwright on specs)
├── .prettierrc.json / .prettierignore
├── playwright.config.js            # Global Playwright configuration
├── package.json
└── CLAUDE.md / AGENTS.md / copilot-instructions.md   # AI-assistant & contributor guidelines
```

Not yet present, despite being referenced elsewhere as target architecture: `.github/workflows/` (no CI configured at all), `visual-baselines/` (no visual regression tests written yet), `tests/api/`, `pages/cart.page.js`, `pages/checkout.page.js`, `pages/payment.page.js`. See [Roadmap](#roadmap).

---

## Prerequisites

- [Node.js](https://nodejs.org/) (LTS recommended)
- [pnpm](https://pnpm.io/installation) — `npm install -g pnpm`

---

## Getting Started

```bash
# 1. Clone the repository
git clone <repo-url>
cd e2e-saucedemo-playwright-framework

# 2. Install dependencies
pnpm install

# 3. Install Playwright browsers
pnpm exec playwright install --with-deps
```

---

## Running Tests

> There's no `pnpm run test` script in `package.json` yet — run Playwright directly via `pnpm exec playwright test` (or add the alias yourself).

```bash
# Run the full suite (chromium only — other browsers are commented out in playwright.config.js)
pnpm exec playwright test

# Run a single spec file
pnpm exec playwright test tests/ui/login.spec.js

# Run a single test by name
pnpm exec playwright test -g "should login with valid credential"

# Run tests by tag
pnpm exec playwright test --grep @smoke

# List tests without running them
pnpm exec playwright test --list

# Run in headed / debug mode
pnpm exec playwright test --debug

# Open the last HTML report
pnpm run report

# Lint / format (no CI exists yet to gate on these — run manually before committing)
pnpm run lint
pnpm run lint:fix
pnpm run format:check
pnpm run format
```

---

## Test Reports

Playwright generates an HTML report after every run:

```bash
pnpm run report
```

This opens an interactive report with test results, execution traces, screenshots, and videos (where captured). Traces are collected automatically `on-first-retry` (see `playwright.config.js`).

---

## Architecture

**Flow:** `tests/{ui,e2e}/*.spec.js` → `fixtures/*.fixture.js` (optional) → `pages/*.page.js` (Page Objects) → `test-data/*` / `utils/*.utils.js`

### Page Objects

Located in [`pages/`](pages) — currently `login.page.js` and `inventory.page.js`. One class per page, named `<pagename>.page.js`, exporting a default class (e.g. `login.page.js` → `class LoginPage`).

Each page object:

- Accepts a Playwright `page` in its constructor and stores it as `this.page`.
- Declares all locators as constructor properties, camelCase and suffixed `Loc` (e.g. `titleLoc`, `usernameLoc`), grouped by UI region with `//` comments.
- Exposes action methods (`login`, `selectSortOrder`, `addProductToCart`, …) that operate on those locators.
- Tests never call `page.locator(...)` directly — they always go through a page object's named locator or method.

`cart.page.js`, `checkout.page.js`, and `payment.page.js` don't exist yet — see [Roadmap](#roadmap).

### Tests

Located in [`tests/`](tests), split by scope:

| Folder      | Purpose                                                | Current specs                            |
| ----------- | ------------------------------------------------------- | ----------------------------------------- |
| `tests/ui`  | Validates a **single page** in isolation                | `login.spec.js`                           |
| `tests/e2e` | Spans **multiple page objects** or a full user journey  | `inventory.spec.js`, `checkout.spec.js` (empty) |
| `tests/api` | API-level tests                                          | doesn't exist yet                         |

Spec filenames are just `<feature>.spec.js` — the `tests/ui`/`tests/e2e` folder itself encodes UI-vs-E2E, not a `.ui.`/`.e2e.` suffix in the filename. Each spec instantiates the relevant page object(s) (directly, or via the `loginUser` fixture) and asserts with `expect` / `expect.soft`.

### Fixtures

Located in [`fixtures/`](fixtures) — currently just `login.fixture.js`, which extends `@playwright/test`'s `base` with a `loginUser` fixture that logs in as `standard_user` and asserts the inventory page is reached before the test body runs. Specs that want a logged-in state import `{ test, expect }` from the fixture file instead of `@playwright/test`. It still drives a real UI login each time — it centralizes the step, it doesn't skip it (see [Roadmap](#roadmap) for the planned `storageState` skip).

### Utils

Located in [`utils/`](utils) — currently just `common.utils.js`, exporting `CommonUtils` with static helpers like `formatPrice("$29.99")` → `29.99`, for pure data transforms that don't belong on a page object.

### Test Data

Located in [`test-data/`](test-data):

- `users-data.js` — `valid.*` / `invalid.*` grouped test user credentials, each with `username`, `password`, and (for invalid users) `errorMsg`.
- `inventory-data.json` — expected product names/prices/descriptions and sort-order values for the inventory page.
- `inventory-sort-data.js` — data-driven sort test cases (`sortOrder`, `direction`, `compare` function pairs).

---

## Test Case Naming Convention

All test titles follow one of these patterns:

```js
// should <expected behavior> with <data>
should login with valid credentials

// should <expected behavior> when <action>
should display error message when submitting empty form

// should <expected behavior> when <action> with <data>
should display error message when submitting form with invalid data

// should <expected behavior>
should display products list
```

---

## Coding Conventions

- **Filenames**: kebab-case (`login.page.js`, `inventory-sort-data.js`) — standard JS/TS convention.
- **Identifiers**: camelCase for variables/properties/methods; PascalCase for classes.
- Locator properties are suffixed with `Loc` (e.g. `usernameLoc`, `titleLoc`).
- One page object class per file; one spec file per feature/page, placed under `tests/ui/` or `tests/e2e/` (the folder, not the filename, encodes which).

Full contributor/AI-agent guidelines live in [`CLAUDE.md`](CLAUDE.md) / [`AGENTS.md`](AGENTS.md) / [`copilot-instructions.md`](copilot-instructions.md).

---

## CI/CD

**Not set up yet.** There is no `.github/` directory in this repo, so no GitHub Actions workflow currently runs on push or PR — lint and tests are run manually (see [Running Tests](#running-tests)).

`docs/frameworks/09-11` describe a target/planned setup (a `lint` → `test` two-job pipeline, action versions pinned to their current majors, plus a manually-triggered `update-visual-baselines.yml` workflow) — treat those as design notes for CI to be built, not a description of what's running today. A Jenkins pipeline is also planned (see [Roadmap](#roadmap)).

---

## Roadmap

- [ ] Set up GitHub Actions CI from scratch — no `.github/workflows/` exists yet (a `lint` → `test` pipeline is designed in `docs/frameworks/09-11` but never implemented)
- [ ] Add a `pnpm run test` script to `package.json` — currently there's no alias, use `pnpm exec playwright test` directly
- [ ] `global-setup.js` to log in once and persist an authenticated `storageState.json`, so tests that don't test login itself can skip the UI login step
- [ ] Complete `cart.page.js`, `checkout.page.js`, `payment.page.js` and their corresponding `tests/e2e` specs (`checkout.spec.js` exists but is empty)
- [ ] `tests/api` coverage — directory doesn't exist yet
- [ ] Visual regression testing — no `snapshotDir` configured, no `toHaveScreenshot()` calls, no `visual-baselines/` directory yet
- [ ] Fix pre-existing `no-unused-vars` lint errors in `tests/e2e/inventory.spec.js` (unused `page`/`loginUser` fixture args) — `pnpm run lint` currently fails
- [ ] CSV-driven data-source support
- [ ] Allure reporting
- [ ] Jenkins pipeline
- [ ] SonarCloud for code quality (see `docs/todo.md`)

> ESLint + Prettier config, the `login.fixture.js` `loginUser` fixture, and the `test-data`/`tests/ui`+`tests/e2e`/`fixtures`/`utils` folder structure are already done.

---

## Contributing

1. Only `main` exists as a branch today (no `qabranch` yet, despite being referenced in some docs as a planned flow) — branch off `main` for new work.
2. Follow the [naming](#test-case-naming-convention) and [coding](#coding-conventions) conventions above.
3. Run `pnpm run lint` and `pnpm run format:check` (or `lint:fix`/`format` to auto-fix) manually — there's no CI to gate on these yet.
4. Ensure `pnpm exec playwright test` passes locally before opening a PR.

---

## License

[ISC](package.json)
