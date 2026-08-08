import { test, expect } from "@playwright/test";
import users from "../data/users";
import LoginPage from "../pages/login.page";

let loginPage;

test.describe("Auth @login", () => {
  test("should login with valid credential", async ({ page }) => {
    // Arrange
    const user = users.valid.standard_user;
    loginPage = new LoginPage(page);

    // Act
    await loginPage.goto("/");
    await loginPage.login(user);

    // Assert
    await expect(page).toHaveTitle("Swag Labs");
  });

  test("should display error when locked out user credentials entered", async ({
    page,
  }) => {
    // Arrange
    const user = users.invalid.locked_out_user;
    loginPage = new LoginPage(page);
    // Act
    loginPage.goto("/");
    loginPage.login(user);
    // Assert
    await expect(loginPage.errorMsg).toHaveText(user.errorMsg);
  });

  test("should display error when invalid username is entered", async ({
    page,
  }) => {
    // Act
    const user = users.invalid.wrong_username;
    loginPage = new LoginPage(page);
    // Act
    await loginPage.goto("/");
    await loginPage.login(user);
    // Assert
    await expect(loginPage.errorMsg).toHaveText(user.errorMsg);
  });

  // data driven test for wrong username & password
  //   for (const username in users.invalid.wrong_both) {
  //     test(`should display error when invalid ${username} is entered`, async ({
  //       page,
  //     }) => {});
  //   }
});
