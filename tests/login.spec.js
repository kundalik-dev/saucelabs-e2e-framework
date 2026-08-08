import { test, expect } from "@playwright/test";
import users from "../data/users";
import LoginPage from "../pages/login.page";

let loginPage;

test.describe("Auth", () => {
  test("should login with valid credential", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("textbox", { name: "Username" }).fill("standard_user");
    await page.getByRole("textbox", { name: "Password" }).fill("secret_sauce");
    await page.getByRole("button", { name: "Login" });
    await expect(page).toHaveTitle("Swag Labs");
  });

  test("should display error when locked out user credentials entered", async ({
    page,
  }) => {
    await page.goto("/");
    await page
      .getByRole("textbox", { name: "Username" })
      .fill("locked_out_user");
    await page.getByRole("textbox", { name: "Password" }).fill("secret_sauce");
    await page.getByRole("button", { name: "Login" }).click();

    await expect(page.getByRole("heading", { level: 3 })).toHaveText(
      "Epic sadface: Sorry, this user has been locked out.",
    );
  });

  test("should display error when invalid username is entered", async ({
    page,
  }) => {
    await page.goto("/");
    await page
      .getByRole("textbox", { name: "Username" })
      .fill("wrong_username");
    await page.getByRole("textbox", { name: "Password" }).fill("secret_sauce");
    await page.getByRole("button", { name: "Login" }).click();
    const errorMsg = page.getByRole("heading", { level: 3 });
    await expect(errorMsg).toHaveText(
      "Epic sadface: Username and password do not match any user in this service",
    );
  });

  // data driven test for wrong username & password
  //   for (const username in users.invalid.wrong_both) {
  //     test(`should display error when invalid ${username} is entered`, async ({
  //       page,
  //     }) => {});
  //   }

  // With POM implementation
  test("should login with valid credential with POM", async ({ page }) => {
    // Arrange
    const user = users.valid.standard_user;
    loginPage = new LoginPage(page);

    // Act
    await loginPage.goto("/");
    await loginPage.login(users.valid.standard_user);

    // Assert
    await expect(page).toHaveTitle("Swag Labs");
  });
});
