import { test as base, expect } from "@playwright/test";
import LoginPage from "../pages/login.page";
import users from "../test-data/users-data";
import inventory from "../test-data/inventory-data.json" with { type: "json" };
import { loginData } from "../test-data/login-page-data";

const test = base.extend({
  loginFixture: async ({ page }, use) => {
    // SETUP
    const user = users.valid.standardUser;
    let loginPage = new LoginPage(page);

    await loginPage.goto(loginData.loginPageUrl);
    await loginPage.login(user);
    await expect(page).toHaveURL(inventory.basicData.pageUrl);
    console.log("completed running loginFixture setup.");

    // TEST RUNS HERE
    await use();

    // TEARDOWN
    console.log("closing loginFixture");
  },
});

export { test, expect };
