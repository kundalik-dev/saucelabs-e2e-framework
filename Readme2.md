# 🎭 SauceDemo E2E Automation Framework

A scalable **end-to-end UI test automation framework** built with **JavaScript and Playwright Test** for [SauceDemo](https://www.saucedemo.com/).

The framework is designed to demonstrate real-world automation practices such as **Page Object Model, reusable fixtures, authenticated test execution, parallel testing, data-driven testing, test isolation, reporting, and CI/CD integration**.

## Tech Stack

| Technology          | Purpose                        |
| ------------------- | ------------------------------ |
| JavaScript (ESM)    | Test development               |
| Playwright Test     | UI automation & test runner    |
| Page Object Model   | Maintainable test architecture |
| Playwright Fixtures | Reusable test setup            |
| `storageState`      | Authentication/session reuse   |
| JSON / JS           | External test data             |
| pnpm                | Package management             |
| ESLint + Prettier   | Code quality                   |
| HTML Reporter       | Test reporting                 |
| GitHub Actions      | CI/CD                          |

## Framework Highlights

- **Page Object Model** for maintainable UI interactions
- **Reusable Playwright fixtures** for common test setup
- **`storageState` authentication** to avoid repeating UI login for tests that do not validate login
- **Parallel test execution** to reduce suite execution time
- **Test isolation** using independent browser contexts
- **Data-driven testing** using external JSON/JavaScript data
- **Environment-based configuration** for URL, workers, retries and headless execution
- **Automatic retries in CI** for handling transient failures
- **Trace collection** for debugging failed/retried tests
- **HTML test reports** for execution analysis
- **ESLint + Prettier** for consistent code quality
- **GitHub Actions CI** for automated validation
- **Tag-based test execution** for smoke/regression subsets

## What the Framework Automates

### Login

- Login with valid credentials
- Invalid username/password scenarios
- Locked-out user validation
- Login error message validation

### Inventory

- Product list validation
- Product information validation
- Product sorting
- Add product to cart
- Remove product from cart
- Data-driven sorting scenarios

### Checkout

The framework is structured to support complete checkout journeys using separate page objects for:

```text
Inventory → Cart → Checkout → Payment → Order Confirmation
```

## Architecture

```text
                         Playwright Test
                              │
                              ▼
                         Test Specs
                    ┌─────────┴─────────┐
                    ▼                   ▼
                UI Tests            E2E Tests
                    │                   │
                    └─────────┬─────────┘
                              ▼
                           Fixtures
                              │
                    ┌─────────┴─────────┐
                    ▼                   ▼
              Authentication        Test Setup
              (storageState)
                    │
                    ▼
                  Pages
                    │
          ┌─────────┼─────────┐
          ▼         ▼         ▼
       Login     Inventory   Checkout
                              │
                              ▼
                         SauceDemo App

        Test Data ───────────► Tests
        Utils ───────────────► Tests
```

## Project Structure

```text
├── pages/
│   ├── login.page.js
│   ├── inventory.page.js
│   ├── cart.page.js
│   ├── checkout.page.js
│   └── payment.page.js
│
├── fixtures/
│   ├── login.fixture.js
│   └── auth.fixture.js
│
├── tests/
│   ├── ui/
│   │   └── login.spec.js
│   └── e2e/
│       ├── inventory.spec.js
│       └── checkout.spec.js
│
├── test-data/
│   ├── users-data.js
│   ├── inventory-data.json
│   └── inventory-sort-data.js
│
├── utils/
│   └── common.utils.js
│
├── auth/
│   └── storage-state.json
│
├── docs/
│   └── test-cases/
│
├── .github/
│   └── workflows/
│       └── playwright.yml
│
├── playwright.config.js
├── eslint.config.mjs
├── .prettierrc.json
└── package.json
```

## Authentication Strategy

The framework uses Playwright's **`storageState`** to reuse authenticated sessions.

Instead of performing UI login before every test:

```text
Without storageState

Test → Open App → Login → Test
Test → Open App → Login → Test
Test → Open App → Login → Test
```

The framework can authenticate once and reuse the session:

```text
Authentication Setup
        │
        ▼
storageState.json
        │
        ├── Test 1
        ├── Test 2
        ├── Test 3
        └── Test 4
```

Login tests still perform the actual UI login because authentication itself needs to be tested.

Tests that are focused on inventory, cart or checkout can start from an authenticated state.

## Parallel Execution

Playwright workers are used to execute independent tests in parallel.

Example configuration:

```js
workers: process.env.CI ? 4 : undefined;
```

This allows the suite to scale across multiple workers while maintaining test isolation through separate browser contexts.

Parallel execution is especially useful when the suite grows because tests do not need to wait for unrelated scenarios to finish sequentially.

## Test Isolation

Each test runs in its own Playwright browser context.

This prevents:

- Cookies leaking between tests
- Local storage being shared unintentionally
- Authentication state affecting unrelated tests
- Test order dependencies

The goal is for every test to be independently executable.

## Fixtures

Fixtures provide reusable test setup and keep test files focused on business scenarios.

Examples:

```text
login.fixture.js
    └── Provides logged-in test state

auth.fixture.js
    └── Loads authenticated storageState
```

This avoids repeating authentication and common setup code across test files.

## Data-Driven Testing

Test data is separated from test logic.

Example:

```text
test-data/
├── users-data.js
├── inventory-data.json
└── inventory-sort-data.js
```

This allows the same test logic to be executed against multiple datasets.

For example, inventory sorting can be represented as:

```text
Price Low → High
Price High → Low
Name A → Z
Name Z → A
```

The comparison logic remains in the test framework while the scenario data remains external.

## Configuration

`playwright.config.js` centralizes framework configuration.

Supported environment variables include:

```env
BASE_URL=https://www.saucedemo.com/
HEADLESS=true
RETRIES=2
WORKERS=4
```

This allows the same test suite to run locally and in CI without changing test code.

### Default Behavior

- Chromium enabled
- Headless execution enabled
- HTML reporting
- Trace on first retry
- Configurable workers
- Configurable retries
- `data-test` used as Playwright's test ID attribute

## Test Execution

### Install dependencies

```bash
pnpm install
pnpm exec playwright install --with-deps chromium
```

### Run all tests

```bash
pnpm exec playwright test
```

### Run a specific test file

```bash
pnpm exec playwright test tests/ui/login.spec.js
```

### Run a specific test

```bash
pnpm exec playwright test -g "should login with valid credentials"
```

### Run smoke tests

```bash
pnpm exec playwright test --grep @smoke
```

### Run in debug mode

```bash
pnpm exec playwright test --debug
```

### View HTML report

```bash
pnpm run report
```

## Debugging & Failure Analysis

Playwright tracing is enabled for retries.

When a test fails, the generated artifacts can be used to investigate:

- Page actions
- Locator interactions
- Network activity
- Screenshots
- DOM snapshots
- Timing information

This makes debugging failures easier than relying only on console output.

## Test Naming

Tests follow a behavior-focused naming convention:

```text
should <expected behavior>
should <expected behavior> with <data>
should <expected behavior> when <action>
should <expected behavior> when <action> with <data>
```

Examples:

```text
should login with valid credentials
should not login with invalid credentials
should display products list
should sort products by price
should add product to cart when clicking on add to cart button
should display error message when submitting form with invalid data
```

## Coding Standards

- Page objects contain UI interaction logic.
- Tests contain business scenarios and assertions.
- Test data is kept outside test files.
- Reusable setup belongs in fixtures.
- Generic data transformation belongs in utilities.
- Prefer `getByRole()` and `getByTestId()` over brittle CSS selectors.
- Locators use the `Loc` suffix.
- Files use lowercase kebab-case.
- Classes use PascalCase.
- Variables, methods and properties use camelCase.

## CI/CD

GitHub Actions runs the automation suite in a clean environment.

```text
                Git Push / Pull Request
                         │
                         ▼
                  Install Dependencies
                         │
                         ▼
                 Lint + Format Check
                         │
                         ▼
                 Install Chromium
                         │
                         ▼
              Run Playwright in Parallel
                         │
                  ┌──────┴──────┐
                  ▼             ▼
               Success        Failure
                  │             │
                  ▼             ▼
              HTML Report   Test Artifacts
```

The CI pipeline is configured to:

- Install dependencies using pnpm
- Run ESLint
- Run Prettier validation
- Install Chromium
- Execute Playwright tests
- Run tests in headless mode
- Use parallel workers
- Retry failed tests in CI
- Upload the Playwright HTML report
- Upload failure artifacts for debugging

## Test Scope

### Current Automation Areas

- [x] Login
- [x] Invalid login scenarios
- [x] Inventory
- [x] Product sorting
- [x] Add/remove cart items
- [x] Test data management
- [x] Page Object Model
- [x] Playwright fixtures
- [x] Authentication/session reuse
- [x] Parallel execution
- [x] Retry strategy
- [x] HTML reporting
- [x] ESLint + Prettier
- [x] GitHub Actions CI

### Planned Extensions

- [ ] Complete checkout workflow
- [ ] Visual regression testing
- [ ] Allure reporting
- [ ] Jenkins integration
- [ ] SonarCloud integration

## Key Automation Practices Demonstrated

This project focuses on practices commonly used in production automation frameworks:

**Maintainability**
Page Objects separate UI implementation from test scenarios.

**Reusability**
Fixtures, utilities and shared authentication prevent duplicated setup.

**Scalability**
Parallel workers and external test data allow the suite to grow without making execution unnecessarily slow.

**Reliability**
Test isolation, Playwright auto-waiting, retries and tracing help reduce and diagnose flaky failures.

**CI Readiness**
The same tests can run locally and in GitHub Actions with environment-based configuration.

**Debuggability**
HTML reports and Playwright traces provide detailed information when tests fail.

## License

ISC
