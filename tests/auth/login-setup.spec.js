import { test as setup, expect } from "@playwright/test";
import LoginPage from "../../pages/login.page";
import users from "../../test-data/users.data";
import { loginData } from "../../test-data/login-page.data";

setup("Login Storage state auth setup", async ({ page }) => {
  const loginPage = new LoginPage(page);
  const user = users.valid.standardUser;
  await loginPage.goto(loginData.loginPageUrl);
  await loginPage.login(user);
  await expect(page).toHaveURL(loginData.loginPageUrl);
});
