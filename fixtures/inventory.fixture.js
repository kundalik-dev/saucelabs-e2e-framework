import { test as base, expect } from "@playwright/test";
import InventoryPage from "../pages/inventory.page";
import inventory from "../test-data/inventory-page.data.json" with { type: "json" };

/**
 * Storage-state based fixture for specs that don't need to exercise the
 * login form. Assumes the consuming spec has already opted into the
 * generated session via `test.use({ storageState: "./auth/storageState.json" })`
 * (see tests/auth/auth.setup.js) — this fixture only handles the page-object
 * wiring: instantiate InventoryPage and land on the inventory page, since a
 * restored storageState carries cookies/local storage but the page itself
 * still starts blank.
 */
const test = base.extend({
  inventoryPage: async ({ page }, use) => {
    // SETUP
    const inventoryPage = new InventoryPage(page);
    await inventoryPage.goto(inventory.basicData.pageUrl);

    // TEST RUNS HERE
    await use(inventoryPage);

    // TEARDOWN
    console.log("closing inventoryPage fixture");
  },
});

export { test, expect };
