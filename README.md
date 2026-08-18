# 🎭 SauceDemo E2E Automation Framework

Playwright-based end-to-end UI automation framework built in **JavaScript** for [SauceDemo](https://www.saucedemo.com/).

The project demonstrates practical test automation concepts including **Page Object Model, reusable fixtures, external test data, data-driven testing, assertions, reporting, linting/formatting, and GitHub Actions CI**.

## Tech Stack

| Tool                     | Purpose                     |
| ------------------------ | --------------------------- |
| JavaScript (ESM)         | Programming language        |
| Playwright Test          | E2E test automation         |
| Page Object Model        | Test architecture           |
| JSON / JS                | External test data          |
| pnpm                     | Package management          |
| ESLint + Prettier        | Code quality and formatting |
| Playwright HTML Reporter | Test reporting              |
| GitHub Actions           | CI                          |

## What I Built

- Page Object Model for Login and Inventory pages
- UI and E2E test separation
- Reusable Playwright login fixture
- Externalized test data for users, products, and sorting
- Data-driven inventory sorting tests
- Reusable utility functions for test data transformation
- Playwright HTML reports with trace support
- ESLint and Prettier configuration
- GitHub Actions pipeline for linting and automated tests
- Chromium-based test execution
- Environment-based configuration for `BASE_URL`, `HEADLESS`, `RETRIES`, and `WORKERS`

## Project Structure

```text
├── pages/                  # Page Objects
│   ├── login.page.js
│   └── inventory.page.js
│
├── tests/
│   ├── ui/                 # Single-page UI tests
│   │   └── login.spec.js
│   └── e2e/                # Multi-page/user-flow tests
│       ├── inventory.spec.js
│       └── checkout.spec.js
│
├── fixtures/               # Reusable Playwright fixtures
│   └── login.fixture.js
│
├── test-data/              # External test data
│   ├── users-data.js
│   ├── inventory-data.json
│   └── inventory-sort-data.js
│
├── utils/                  # Reusable non-UI helpers
│   └── common.utils.js
│
├── docs/                   # Test cases and framework notes
├── .github/workflows/      # GitHub Actions
├── playwright.config.js    # Playwright configuration
├── eslint.config.mjs       # ESLint configuration
└── package.json
```

## Test Coverage

Current automation covers the main areas of the SauceDemo login and inventory functionality, including:

- Login with valid credentials
- Login validation with invalid credentials
- Inventory page validation
- Product list validation
- Product sorting
- Add/remove products from cart
- Reusable authenticated test setup through fixtures

Additional checkout/page-object work is planned but is **not yet implemented**.

## Architecture

```text
Test Specs
    ↓
Fixtures (when required)
    ↓
Page Objects
    ↓
SauceDemo Application

Test Data ───────────────┐
                         ↓
Test Specs → Page Objects → Assertions
                         ↑
Utils ──────────────────┘
```

### Page Objects

Each page has its own class under `pages/`.

Example:

```text
login.page.js     → LoginPage
inventory.page.js → InventoryPage
```

Tests interact with page-object methods and locators instead of using raw selectors directly in the test.

### Fixtures

`fixtures/login.fixture.js` provides a reusable logged-in test setup.

The fixture performs a **real UI login** using `standard_user`; it does not currently use Playwright `storageState`.

### Test Data

Test data is kept outside the tests:

- `users-data.js` — valid and invalid login users
- `inventory-data.json` — inventory expectations
- `inventory-sort-data.js` — data-driven sorting scenarios

This keeps test logic separate from test data and makes scenarios easier to maintain.

## Running the Tests

### Install

```bash
pnpm install
pnpm exec playwright install --with-deps chromium
```

### Run all tests

```bash
pnpm exec playwright test
```

### Run a specific spec

```bash
pnpm exec playwright test tests/ui/login.spec.js
```

### Run by test name

```bash
pnpm exec playwright test -g "should login with valid credentials"
```

### Run tagged tests

```bash
pnpm exec playwright test --grep @smoke
```

### Debug

```bash
pnpm exec playwright test --debug
```

### View HTML report

```bash
pnpm run report
```

### Code quality

```bash
pnpm run lint
pnpm run format:check
```

## Configuration

`playwright.config.js` provides:

- Default `baseURL`: `https://www.saucedemo.com/`
- `data-test` as Playwright's test ID attribute
- Headless/headed execution through `HEADLESS`
- Configurable `BASE_URL`, `RETRIES`, and `WORKERS`
- HTML reporting
- Trace collection on first retry
- Chromium project enabled

Example local `.env`:

```env
BASE_URL=https://www.saucedemo.com/
HEADLESS=true
```

## CI

GitHub Actions workflow:

```text
Lint + Format Check
        ↓
Playwright Tests
        ↓
HTML Report
```

The current workflow:

- Runs on pushes to `main`
- Runs ESLint and Prettier checks
- Installs Chromium
- Runs Playwright tests in headless mode
- Uploads the HTML report
- Uploads test artifacts when tests fail

> Pull-request execution is currently not enabled in the workflow.

## Coding Conventions

- Files use lowercase kebab-case: `login.page.js`
- Variables, methods, and properties use camelCase
- Classes use PascalCase
- Locators use the `Loc` suffix: `usernameLoc`
- Page objects contain UI interaction logic
- Tests contain test scenarios and assertions
- Reusable test data belongs in `test-data/`
- Generic data transformation belongs in `utils/`

## Current Status

### Implemented

- [x] Playwright framework setup
- [x] Page Object Model
- [x] Login page automation
- [x] Inventory page automation
- [x] Reusable login fixture
- [x] External test data
- [x] Data-driven sorting
- [x] Utility helpers
- [x] ESLint + Prettier
- [x] HTML reporting
- [x] GitHub Actions CI
- [x] Allure reporting

### Planned

- [ ] Cart page object
- [ ] Checkout/payment page objects
- [ ] Complete checkout E2E flow
- [ ] Playwright `storageState` authentication
- [ ] Visual regression testing
- [ ] Jenkins pipeline
- [ ] SonarCloud integration

## License

ISC
