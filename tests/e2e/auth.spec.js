import { test, expect } from "../../fixtures/auth.fixture";
import { loginData } from "../../test-data/login-page.data";
import inventoryData from "../../test-data/inventory-page.data.json" with { type: "json" };

test.describe("Auth @e2e", () => {
  test.describe("unauthenticated access", () => {
    /**
     * Overrides auth.fixture's default storageState so this one test runs
     * with no session at all.
     */
    test.use({ storageState: { cookies: [], origins: [] } });

    test("should prevent access to the inventory page when the user is not logged in", async ({
      loginPage,
      page,
    }) => {
      //act :- attempt to open the protected inventory URL directly, with no session
      await page.goto(inventoryData.basicData.pageUrl);

      //assert :- redirected back to the login page with the access-denied error
      await expect(page).toHaveURL(loginData.loginPageUrl);
      await expect(loginPage.getErrorMessage).toHaveText(
        `Epic sadface: You can only access '${inventoryData.basicData.pageUrl}' when you are logged in.`
      );
    });
  });

  test("should redirect to the login page after an explicit user logout", async ({
    inventoryPage,
    page,
  }) => {
    //act
    await inventoryPage.logout();

    //assert
    await expect(page).toHaveURL(loginData.loginPageUrl);
  });
});
