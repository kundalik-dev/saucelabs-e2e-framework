import { test as base, expect } from "@playwright/test";
import LoginPage from "../pages/login.page";
import users from "../test-data/users-data";
import inventory from "../test-data/inventory-data.json" with { type: "json" };

const test = base.extend({
  loginUser: async ({ page }, use) => {
    // SETUP
    const user = users.valid.standard_user;
    let loginPage = new LoginPage(page);

    await loginPage.goto("/");
    await loginPage.login(user);
    await expect(page).toHaveURL(inventory.basicData.pageUrl);

    // TEST RUNS HERE
    await use();

    // TEARDOWN
    console.log("closing loginUser fixture");
  },
});

export { test, expect };
