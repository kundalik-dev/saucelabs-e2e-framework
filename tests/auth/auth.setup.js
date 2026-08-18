import { test as setup, expect } from "@playwright/test";
import LoginPage from "../../pages/login.page";
import users from "../../test-data/users.data";
import { loginData } from "../../test-data/login-page.data";
import inventoryData from "../../test-data/inventory-page.data.json" with { type: "json" };

// Setup - storage state setup
setup("Login Storage state auth setup", async ({ page }) => {
  const loginPage = new LoginPage(page);
  const user = users.valid.standardUser;

  await loginPage.goto(loginData.loginPageUrl);
  await loginPage.login(user);
  await expect(page).toHaveURL(inventoryData.basicData.pageUrl);

  await page.context().storageState({ path: "./auth/storageState.json" });
});
