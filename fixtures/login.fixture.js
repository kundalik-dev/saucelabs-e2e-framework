import { test as base, expect } from "@playwright/test";
import LoginPage from "../pages/login.page";
import users from "../data/users";

const test = base.extend({
  loginUser: async ({ page }, use) => {
    // SETUP
    const user = users.valid.standard_user;
    let loginPage = new LoginPage(page);

    await loginPage.goto("/");
    await loginPage.login(user);
    await expect(page).toHaveURL("/inventory.html");

    // TEST RUNS HERE
    await use();

    // TEARDOWN
    console.log("closing loginUser fixture");
  },
});

export { test, expect };
