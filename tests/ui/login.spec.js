import { test, expect } from "../../fixtures/pages.fixture";
import users from "../../test-data/users.data";
import { loginData } from "../../test-data/login-page.data";

/* Imports pages.fixture (not auth.fixture) on purpose. As the `loginPage`
 * fixture handles construction + the initial goto(). And for login specs, we want to test the login page itself, not a post-login page.
 */
test.describe("Auth @login", () => {
  test("should login with valid credential", async ({ loginPage, page }) => {
    // Arrange
    const user = users.valid.standardUser;

    // Act
    await loginPage.login(user);

    // Assert
    await expect(page).toHaveTitle(loginData.pageTitle);
  });

  test("should display error when locked out user's credentials entered", async ({
    loginPage,
  }) => {
    // Arrange
    const user = users.invalid.lockedOutUser;
    // Act
    await loginPage.login(user);
    // Assert
    await expect(loginPage.getErrorMessage).toHaveText(user.errorMsg);
  });

  test("should display error when invalid username is entered", async ({
    loginPage,
  }) => {
    // Arrange
    const user = users.invalid.wrongUsername;
    // Act
    await loginPage.login(user);
    // Assert
    await expect(loginPage.getErrorMessage).toHaveText(user.errorMsg);
  });

  test("should display error when invalid password is entered", async ({
    loginPage,
  }) => {
    // Arrange
    const user = users.invalid.wrongPassword;
    // Act
    await loginPage.login(user);
    // Assert
    await expect(loginPage.getErrorMessage).toHaveText(user.errorMsg);
  });
});
