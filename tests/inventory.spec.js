import { test, expect } from "@playwright/test";
import users from "../data/users";
import LoginPage from "../pages/login.page";
import InventoryPage from "../pages/inventory.page";
import inventoryData from "../data/inventory.json" with { type: "json" };

let loginPage;
let inventoryPage;

test.describe("Inventory test", () => {
  test(
    "should navigate to the inventory page after login",
    { tag: ["@smoke", "@inventory"] },
    async ({ page }) => {
      // Arrange
      const user = users.valid.standard_user;
      const inventory = inventoryData.basicData;

      loginPage = new LoginPage(page);
      inventoryPage = new InventoryPage(page);

      // Act
      await loginPage.goto("/");
      await loginPage.login(user);

      // Assert
      await expect(inventoryPage.title_loc).toHaveText(inventory.title);
    }
  );

  test("should display all available products", async ({ page }) => {
    // Arrange
    const user = users.valid.standard_user;
    const expectedProductNames = Object.values(inventoryData.productData).map(
      (product) => product.name
    );

    loginPage = new LoginPage(page);
    inventoryPage = new InventoryPage(page);

    // Act
    await loginPage.goto("/");
    await loginPage.login(user);

    // assert products: as this auto waits
    await expect
      .soft(inventoryPage.inventoryItems_loc)
      .toHaveCount(expectedProductNames.length);

    // this not auto waits so kept after first asserting the count to avoid flakiness
    const actProductNames = await inventoryPage.getAllProductNames();
    expect(actProductNames).toEqual(expectedProductNames);
  });

  test("should display the correct product information", async ({ page }) => {
    const user = users.valid.standard_user;
    const expectedProducts = Object.values(inventoryData.productData);

    const expectedNames = expectedProducts.map((p) => p.name);
    const expectedPrices = expectedProducts.map((p) => p.price);
    const expectedDescriptions = expectedProducts.map((p) => p.description);

    loginPage = new LoginPage(page);
    inventoryPage = new InventoryPage(page);

    await loginPage.goto("/");
    await loginPage.login(user);

    await expect(inventoryPage.inventoryItems_loc).toHaveCount(
      expectedProducts.length
    );

    const actualNames = await inventoryPage.getAllProductNames();
    const actualPrices = await inventoryPage.getAllProductPrices();
    const actualDescriptions = await inventoryPage.getAllProductDescriptions();

    expect(actualNames).toEqual(expectedNames);
    expect(actualPrices).toEqual(expectedPrices);
    expect(actualDescriptions).toEqual(expectedDescriptions);
  });

  test("should add a product to the cart", async ({ page }) => {
    const user = users.valid.standard_user;
    const products = inventoryData.productData.Backpack;

    loginPage = new LoginPage(page);
    inventoryPage = new InventoryPage(page);

    await loginPage.goto("/");
    await loginPage.login(user);

    await inventoryPage.addProductToCart(products.name).click();

    await expect(page).toHaveTitle("Swag Labs");
  });
});
