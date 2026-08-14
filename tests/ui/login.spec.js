import { test, expect } from "@playwright/test";
import users from "../../test-data/users-data";
import LoginPage from "../../pages/login.page";
import { loginData } from "../../test-data/login-page-data";

/** @type {LoginPage} */
let loginPage;

test.describe("Auth @login", () => {
  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto(loginData.loginPageUrl);
  });

  test("should login with valid credential", async ({ page }) => {
    // Arrange
    const user = users.valid.standardUser;

    // Act
    await loginPage.login(user);

    // Assert
    await expect(page).toHaveTitle(loginData.pageTitle);
  });

  test("should display error when locked out user's credentials entered", async ({}) => {
    // Arrange
    const user = users.invalid.lockedOutUser;
    // Act
    loginPage.login(user);
    // Assert
    await expect(loginPage.getErrorMessage).toHaveText(user.errorMsg);
  });

  test("should display error when invalid username is entered", async ({}) => {
    // Act
    const user = users.invalid.wrongUsername;
    // Act
    await loginPage.login(user);
    // Assert
    await expect(loginPage.getErrorMessage).toHaveText(user.errorMsg);
  });

  test("should display error when invalid password is entered", async ({}) => {
    // Act
    const user = users.invalid.wrongPassword;
    // Act
    await loginPage.login(user);
    // Assert
    await expect(loginPage.getErrorMessage).toHaveText(user.errorMsg);
  });
});
