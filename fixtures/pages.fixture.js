import { test as base, expect } from "@playwright/test";
import LoginPage from "../pages/login.page";
import InventoryPage from "../pages/inventory.page";
import CartPage from "../pages/cart.page";
import { loginData } from "../test-data/login-page.data";
import inventoryData from "../test-data/inventory-page.data.json" with { type: "json" };

/**
 * Page object fixtures — injection only, NO authentication.
 *
 * Each fixture is named after the object it provides (`loginPage`, not
 * `loginFixture`), so it reads as a value at the destructuring site:
 *
 *     test("...", async ({ inventoryPage }) => { ... });
 *
 * Fixtures are lazy: a test that destructures only `{ inventoryPage }` never
 * constructs LoginPage. Keeping every page object in one file matters because
 * a spec can only import a single `test` object — a multi-page journey such as
 * tests/e2e/checkout.spec.js needs several page objects from one import.
 *
 * Auth deliberately lives elsewhere (see auth.fixture.js) so that login specs
 * can use `loginPage` while staying anonymous.
 *
 * See docs/frameworks/12-fixtures-and-storage-state.md.
 */
const test = base.extend({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto(loginData.loginPageUrl);
    await use(loginPage);
  },

  /* storageState restores cookies/local storage but not the current URL, so an
   * authenticated test still opens on about:blank — this goto() is what lands
   * it on the inventory page. */
  inventoryPage: async ({ page }, use) => {
    const inventoryPage = new InventoryPage(page);
    await inventoryPage.goto(inventoryData.basicData.pageUrl);
    await use(inventoryPage);
  },

  /* No goto() here: the cart is reached by clicking the header cart icon
   * (see InventoryPage.openCart()), not by direct URL entry, so the test
   * drives navigation itself once items are in the cart. */
  cartPage: async ({ page }, use) => {
    const cartPage = new CartPage(page);
    await use(cartPage);
  },
});

export { test, expect };
