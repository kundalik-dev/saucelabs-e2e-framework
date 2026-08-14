import { test, expect } from "@playwright/test";
import users from "../../test-data/users-data";
import LoginPage from "../../pages/login.page";

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
    await expect(loginPage.errorMsgLoc).toHaveText(user.errorMsg);
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
    await expect(loginPage.errorMsgLoc).toHaveText(user.errorMsg);
  });
});
