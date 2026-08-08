# 🎭 SauceDemo E2E Automation Framework

![Playwright Tests](https://github.com/kundalik-dev/e2e-saucedemo-playwright/actions/workflows/playwright.yml/badge.svg)
![Playwright](https://img.shields.io/badge/Playwright-1.61-2EAD33?logo=playwright&logoColor=white)
![Node](https://img.shields.io/badge/Node-LTS-339933?logo=node.js&logoColor=white)
![pnpm](https://img.shields.io/badge/pnpm-10.32-F69220?logo=pnpm&logoColor=white)
![License](https://img.shields.io/badge/License-ISC-blue.svg)

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
| CI/CD           | GitHub Actions                                       |
| Target App      | [saucedemo.com](https://www.saucedemo.com/)          |

---

## Project Structure

```
03-e2e-saucedemo-pw-framework/
├── .github/
│   └── workflows/
│       ├── playwright.yml              # CI: lint job → test job (needs: lint)
│       └── update-visual-baselines.yml # Manual-only: regenerates visual snapshots on Linux
├── docs/
│   ├── frameworks/                # Target architecture (01-07) + implementation logs (08-11)
│   └── test-cases/                # Manual/automation test case documentation
├── pages/                         # Page Object Model classes
│   ├── login.page.js
│   ├── inventory.page.js
│   ├── cart.page.js
│   ├── checkout.page.js
│   └── payment.page.js
├── test-data/                      # Test data fixtures (JSON / JS)
│   ├── auth-data.js
│   ├── inventory-data.json
│   └── footer-data.js
├── tests/
│   ├── ui/                         # Single-page / component-level UI tests
│   ├── e2e/                        # Multi-page, full user-journey tests
│   └── api/                        # API-level tests
├── visual-baselines/               # Approved snapshots for visual regression tests
├── playwright-report/              # Generated HTML report (git-ignored)
├── test-results/                   # Raw test run artifacts (git-ignored)
├── eslint.config.mjs               # ESLint flat config (+ eslint-plugin-playwright on specs)
├── .prettierrc.json / .prettierignore
├── playwright.config.js            # Global Playwright configuration
├── package.json
└── CLAUDE.md / AGENTS.md           # AI-assistant & contributor guidelines
```

---

## Prerequisites

- [Node.js](https://nodejs.org/) (LTS recommended)
- [pnpm](https://pnpm.io/installation) — `npm install -g pnpm`

---

## Getting Started

```bash
# 1. Clone the repository
git clone <repo-url>
cd 03-e2e-saucedemo-pw-framework

# 2. Install dependencies
pnpm install

# 3. Install Playwright browsers
pnpm exec playwright install --with-deps
```

---

## Running Tests

```bash
# Run the full suite (chromium only — other browsers are commented out in playwright.config.js)
pnpm run test

# Run a single spec file
pnpm run test tests/ui/auth.ui.spec.js

# Run a single test by name
pnpm run test -g "should login with valid credentials"

# Run tests by tag
pnpm run test --grep @smoke

# Run in headed / debug mode
pnpm run test --debug

# Open the last HTML report
pnpm run report

# Lint / format (CI runs these as a gate before tests)
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

**Flow:** `tests/*.spec.js` → `pages/*.page.js` (Page Objects) → `test-data/*` (fixtures)

### Page Objects

Located in [`pages/`](pages). One class per page, named `<pagename>.page.js`, exporting a default class (e.g. `login.page.js` → `class LoginPage`).

Each page object:

- Accepts a Playwright `page` in its constructor and stores it as `this.page`.
- Declares all locators as constructor properties, grouped by UI region with `//` comments (e.g. _Login Form Inputs_, _Carts locator_, _footer_).
- Exposes action methods (`login`, `launchUrl`, `sortProducts`, …) that operate on those locators.
- Tests never call `page.locator(...)` directly — they always go through a page object's named locator or method.

### Tests

Located in [`tests/`](tests), split by scope:

| Folder      | Purpose                                                |
| ----------- | ------------------------------------------------------ |
| `tests/ui`  | Validates a **single page** in isolation               |
| `tests/e2e` | Spans **multiple page objects** or a full user journey |
| `tests/api` | API-level tests                                        |

Each spec file instantiates the relevant page object(s) in `test.beforeEach`, drives the flow, and asserts with `expect` / `expect.soft`.

### Test Data

Located in [`test-data/`](test-data):

- `<pageName>-data.json` — a single object of expected strings/URLs per page (e.g. `inventory-data.json`).
- `<pageName>List-data.json` — an array of row objects for per-item, data-driven assertions.
- `.js` files (e.g. `auth-data.js`) — used when data needs structure/logic beyond plain JSON (e.g. grouped valid/invalid credential sets).

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

- **camelCase** for all identifiers.
- Locator properties are suffixed with `Loc` (e.g. `usernameLoc`, `productSortLoc`).
- One page object class per file; one spec file per feature/page.

Full contributor/AI-agent guidelines live in [`CLAUDE.md`](CLAUDE.md) / [`AGENTS.md`](AGENTS.md).

---

## CI/CD

**GitHub Actions** (see [`.github/workflows/playwright.yml`](.github/workflows/playwright.yml)) runs on every push and pull request to `main`/`master` (not currently `qabranch` — see `docs/frameworks/11-ci-triggers-and-browser-install-explained.md`), as two jobs:

1. **`lint`** — installs deps, runs `pnpm run lint` (ESLint) and `pnpm run format:check` (Prettier).
2. **`test`** (`needs: lint`, only runs if lint passes) — installs Playwright browsers, runs the suite, uploads the HTML report as a build artifact.

Actions are pinned to their current major versions (`actions/checkout@v7`, `actions/setup-node@v7`, `actions/upload-artifact@v7`) — check `https://api.github.com/repos/<owner>/<repo>/releases/latest` before bumping, GitHub periodically deprecates old runtimes those majors depend on.

A separate, **manually-triggered** workflow, [`update-visual-baselines.yml`](.github/workflows/update-visual-baselines.yml) (`workflow_dispatch` only — never runs on push/PR), regenerates the visual regression baselines under `visual-baselines/` on the same `ubuntu-latest` runner the real CI uses, and commits them back. Run it from the **Actions** tab only after an intentional UI change — see `docs/frameworks/10-ci-fixes-node-runner-and-visual-baselines.md` for the full walkthrough and why it exists (snapshot filenames are OS-specific, so a baseline captured on a dev machine can't satisfy Linux CI).

A Jenkins pipeline is also planned (see [Roadmap](#roadmap)).

---

## Roadmap

- [ ] `global-setup.js` to log in once and persist an authenticated `storageState.json`, so tests that don't test login itself can skip the UI login step
- [ ] Custom Playwright fixtures to auto-wire page objects into tests
- [ ] Complete `cart.page.js`, `checkout.page.js`, `payment.page.js` and their corresponding `tests/e2e` specs
- [ ] `tests/api` coverage
- [ ] CSV-driven data-source support
- [ ] Allure reporting
- [ ] Jenkins pipeline
- [ ] Extend CI triggers (`push`/`pull_request`) to cover `qabranch`, not just `main`/`master`
- [ ] Install only the Chromium binary in CI (`playwright install --with-deps chromium`) instead of all browsers, since only the `chromium` project is enabled

> ESLint + Prettier, GitHub Actions action-version fixes, and the `Update Visual Baselines` workflow are already done — see [CI/CD](#cicd) above.

---

## Contributing

1. Branch off `qabranch` for new work; `qabranch` gets promoted into `main` via PR once validated (a lightweight `feature → qabranch → main` flow).
2. Follow the [naming](#test-case-naming-convention) and [coding](#coding-conventions) conventions above.
3. Run `pnpm run lint` and `pnpm run format:check` (or `lint:fix`/`format` to auto-fix) — CI gates the test job on these passing.
4. Ensure `pnpm run test` passes locally before opening a PR.

---

## License

[ISC](package.json)
