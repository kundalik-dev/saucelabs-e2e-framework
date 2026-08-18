import { test as pagesTest, expect } from "./pages.fixture";

/**
 * Authenticated variant of pages.fixture.
 *
 * Adds nothing but the `storageState` option override, so importing this file
 * instead of pages.fixture IS the opt-in to a logged-in session:
 *
 *     import { test, expect } from "../../fixtures/auth.fixture";   // logged in
 *     import { test, expect } from "../../fixtures/pages.fixture";  // anonymous
 *
 * The session file is produced by tests/auth/auth.setup.js, which the `setup`
 * project in playwright.config.js runs before the chromium project via
 * `dependencies: ["setup"]` — so it is always present and fresh.
 *
 * See docs/frameworks/12-fixtures-and-storage-state.md.
 */
const test = pagesTest.extend({
  storageState: "./auth/storageState.json",
});

export { test, expect };
