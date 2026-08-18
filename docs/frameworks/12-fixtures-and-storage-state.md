# Fixtures and storageState: what each one is for (2026-08-18)

> **Purpose**: Explains the two separate concerns that were previously tangled together in `fixtures/login.fixture.js` — **how a test becomes authenticated** and **what objects get injected into a test** — and records the naming rules and file layout adopted to keep them apart. Read this before adding a new fixture or a new authenticated spec. The fixture files themselves are the source of truth for current state.

---

## 1. The problem this solves

Before this change the framework had one fixture, `loginFixture`, which drove a real UI login on every test that asked for it. It worked, but it conflated two unrelated jobs and produced three visible symptoms:

1. Every authenticated test paid the cost of rendering the login page, filling two fields, and waiting for a navigation — none of which is what those tests are verifying.
2. The fixture handed back nothing (`await use()` with no argument), so tests destructured `{ loginFixture, page }` and then never referenced `loginFixture`. That is what forced the ESLint unused-parameter workarounds visible in the git history.
3. Once `storageState` arrived for `cart.spec.js`, two auth mechanisms coexisted with no rule about which to use where.

The fix is to split the concerns: **`storageState` answers "how am I logged in", fixtures answer "what am I handed".**

---

## 2. Authentication: prefer `storageState`

`storageState` is a JSON file holding the cookies and local-storage entries of an already-authenticated browser context. Log in once, save the file, and every subsequent test starts from that restored session without touching the login form.

**How it is generated.** `tests/auth/auth.setup.js` performs a real UI login as `standard_user` and writes `auth/storageState.json`. It is picked up by the `setup` project in `playwright.config.js`:

```js
{
  name: "setup",
  testMatch: /.*\.setup\.js/,
},
{
  name: "chromium",
  dependencies: ["setup"],
}
```

The `dependencies` entry is what makes this reliable — Playwright runs the `setup` project to completion before any `chromium` test starts, so the session file is always present and fresh. It is **not** something a human has to remember to run first.

**When to still log in through the UI.** `storageState` is the default, not a universal rule. Drive the real login form when the test is _about_ login:

- the login spec itself (valid credentials, error messages),
- locked-out / invalid-credential scenarios, which need an anonymous session by definition,
- session-expiry or logout behaviour.

Everything else — inventory, cart, checkout — should start already authenticated.

---

## 3. Injection: what fixtures are actually for

A fixture is Playwright's setup/teardown plus dependency-injection mechanism. `page` and `browser` are themselves fixtures. Its job is to prepare something the test needs, hand it over, and clean up after. Authentication was only ever _one thing you could do_ inside a fixture, never the definition of one.

With auth handled declaratively, fixtures in this project are for:

- **page objects** — hand the test a constructed, navigated `InventoryPage` instead of repeating `new InventoryPage(page)` in every test,
- **composition** — fixtures may depend on other fixtures, so layered setup (`authenticated` → `cartWithItems` → `checkoutReady`) is built by extension rather than duplication,
- **setup/teardown with a lifetime** — anything that must be torn down after the test, scoped automatically.

---

## 4. Naming rules

**A fixture is named after the noun it provides, not the action it performs.** The name is read at the destructuring site, where it is a value:

```js
test("...", async ({ inventoryPage }) => { ... });
```

This matches Playwright's own documented example, which names its fixture `todoPage`, not `todoSetup`.

Concrete rules:

| Rule                                               | Do                                              | Don't                            |
| -------------------------------------------------- | ----------------------------------------------- | -------------------------------- |
| Name = the object provided                         | `inventoryPage`, `cartPage`, `loginPage`        | `loginFixture`, `setupInventory` |
| No `Fixture` suffix                                | `inventoryPage`                                 | `inventoryPageFixture`           |
| Match the page object, camelCased                  | `InventoryPage` → `inventoryPage`               | `invPage`, `products`            |
| `.fixture` belongs to the **file**, not the export | file `pages.fixture.js`, export `inventoryPage` | export `pagesFixture`            |

**Anti-pattern: the side-effect-only fixture.** If a fixture ends in `await use()` with no argument, it is a disguised `beforeEach` and should not occupy a slot in every test's signature. Either give it something to return, or declare it as an auto fixture so it runs without being destructured:

```js
myAutoSetup: [async ({}, use) => { ...; await use(); }, { auto: true }],
```

---

## 5. Where `storageState` should be declared

Three levels, in increasing reach:

| Level       | How                                                                   | Trade-off                                                                                                                                            |
| ----------- | --------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Per-spec    | `test.use({ storageState: "./auth/storageState.json" })` in each file | Explicit, but repeated in every spec and silently forgotten on new ones — the test then runs logged-out and fails confusingly at the first assertion |
| Per-fixture | override the `storageState` option inside `test.extend()`             | One declaration; importing the fixture _is_ the opt-in. Login specs stay anonymous by importing a different `test`                                   |
| Per-project | `use: { storageState }` on the project in `playwright.config.js`      | Reaches everything including the login spec, which must then explicitly opt back out. Correct at scale via split `logged-in` / `logged-out` projects |

**Adopted: per-fixture.** At four spec files, project splitting is overkill and per-spec repetition is error-prone. The middle option gives one declaration and makes the opt-in self-documenting.

---

## 6. File layout

```text
fixtures/
├── pages.fixture.js   # page object fixtures only — NO authentication
└── auth.fixture.js    # extends pages.fixture, adds the storageState override
```

**Why one `pages.fixture.js` rather than one file per page.** A spec can only import a single `test` object. Per-page fixture files would leave `tests/e2e/checkout.spec.js` — which spans inventory, cart and checkout — unable to get all three without Playwright's `mergeTests()`. A single file exposing every page object avoids that entirely; fixtures are lazy, so a test that destructures only `{ cartPage }` never constructs the others.

**Why `auth.fixture.js` is separate.** `pages.fixture.js` deliberately contains no auth, so the login spec can use `loginPage` while remaining anonymous. `auth.fixture.js` extends it with nothing but the `storageState` override. The import line becomes the statement of intent:

```js
// authenticated
import { test, expect } from "../../fixtures/auth.fixture";

// anonymous
import { test, expect } from "../../fixtures/pages.fixture";
```

---

## 7. Navigation inside fixtures

A page fixture may call `goto()` **only when the page is a legitimate direct-URL entry point** — `loginPage` and `inventoryPage` qualify. Do not put `goto()` in a fixture for a page that is normally reached by clicking through the UI (e.g. a checkout confirmation step): the fixture would navigate away from the state the test just built. For those, construct the page object in the fixture and let the test drive the navigation.

Note that `storageState` restores cookies and local storage but **not** the current URL — a restored session still opens on `about:blank`, so an authenticated test still needs a `goto()` somewhere. That is exactly what the page fixture's `goto()` provides.

---

## 8. Summary of what changed

- `fixtures/login.fixture.js` and the short-lived `fixtures/inventory.fixture.js` → replaced by `pages.fixture.js` + `auth.fixture.js`.
- `loginFixture` → removed; page objects are injected as `loginPage` / `inventoryPage`.
- `test.use({ storageState })` lines → removed from `inventory.spec.js` and `cart.spec.js`; the fixture owns it.
- `login.spec.js` → imports `pages.fixture` and uses the `loginPage` fixture, dropping its `beforeEach` and module-scoped `let loginPage`.
- Auth setup spec → `tests/auth/auth.setup.js`, wired as a `setup` project dependency.
