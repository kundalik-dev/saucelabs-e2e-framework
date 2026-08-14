import { test, expect } from "../fixtures/login.fixture";
import LoginPage from "../pages/login.page";
import InventoryPage from "../pages/inventory.page";
import users from "../data/users-data";
import inventoryData from "../data/inventory-data.json" with { type: "json" };
import { priceSortCases } from "../data/inventory-sort-data";
import { CommonUtils } from "../utils/common";

/** @type {LoginPage} */
let loginPage;
/** @type {InventoryPage} */
let inventoryPage;

test.describe("Inventory Test @inventory", () => {
  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    inventoryPage = new InventoryPage(page);
  });

  test(
    "should navigate to the inventory page after login",
    { tag: ["@smoke", "@inventory"] },
    async ({ page }) => {
      // Arrange
      const user = users.valid.standard_user;
      const inventory = inventoryData.basicData;

      // Act
      await loginPage.goto("/");
      await loginPage.login(user);

      // Assert
      await expect(inventoryPage.pageTitle()).toHaveText(inventory.title);
    }
  );

  test("should display all available products", async ({ page }) => {
    // Arrange
    const user = users.valid.standard_user;
    const expectedProductNames = Object.values(inventoryData.productData).map(
      (product) => product.name
    );

    // Act
    await loginPage.goto("/");
    await loginPage.login(user);

    // assert products: as this auto waits
    await expect(inventoryPage.getInventoryCount()).toHaveCount(
      expectedProductNames.length
    );

    // this not auto waits so kept after first asserting the count to avoid flakiness
    const actProductNames = await inventoryPage.getAllProductNames();
    expect(actProductNames).toEqual(expectedProductNames);
  });

  test("should display the correct product information", async ({
    loginUser,
    page,
  }) => {
    const user = users.valid.standard_user;
    const expectedProducts = Object.values(inventoryData.productData);

    const expectedNames = expectedProducts.map((p) => p.name);
    const expectedPrices = expectedProducts.map((p) => p.price);
    const expectedDescriptions = expectedProducts.map((p) => p.description);

    await expect(inventoryPage.getInventoryCount()).toHaveCount(
      expectedProducts.length
    );

    const actualNames = await inventoryPage.getAllProductNames();
    const actualPrices = await inventoryPage.getAllProductPrices();
    const actualDescriptions = await inventoryPage.getAllProductDescriptions();

    expect(actualNames).toEqual(expectedNames);
    expect(actualPrices).toEqual(expectedPrices);
    expect(actualDescriptions).toEqual(expectedDescriptions);
  });

  test("should add a product to the cart", async ({ loginUser, page }) => {
    //arrange
    const product = inventoryData.productData.Backpack.name;

    //act
    await inventoryPage.addProductToCart(product);

    //assert
    await expect(inventoryPage.cartProductCount()).toHaveCount(1);
  });

  test("should sort products name in descending alphabetical order (Z to A)", async ({
    loginUser,
    page,
  }) => {
    //arrange
    const sortOrder = inventoryData.sortOrder.name.z_a;
    const productNames = await inventoryPage.getAllProductNames();
    const expectedNames = [...productNames].sort((a, b) => b.localeCompare(a));

    //act
    await inventoryPage.selectSortOrder(sortOrder);

    await expect(inventoryPage.getFirstProductName()).toHaveText(
      expectedNames[0]
    );

    const actualNames = await inventoryPage.getAllProductNames();

    //assert
    expect(actualNames).toEqual(expectedNames);
  });

  for (const { sortOrder, direction, compare } of priceSortCases) {
    test(`should sort products ${direction}`, async ({ loginUser, page }) => {
      // Get prices before applying sort
      const initialPriceTexts = await inventoryPage.getAllProductPrices();

      // Convert "$29.99" → 29.99
      const initialPrices = CommonUtils.formatPrices(initialPriceTexts);

      // Create expected result without modifying initialPrices
      const expectedPrices = [...initialPrices].sort(compare);

      // Apply sorting on the UI
      await inventoryPage.selectSortOrder(sortOrder);

      // Verify the first product has the expected price
      await expect(inventoryPage.getFirstProductPrice()).toHaveText(
        `$${expectedPrices[0]}`
      );

      // Get prices after applying sort
      const sortedPriceTexts = await inventoryPage.getAllProductPrices();

      // Convert UI price strings to numbers
      const actualPrices = CommonUtils.formatPrices(sortedPriceTexts);

      // Verify complete sorted list
      expect(actualPrices).toEqual(expectedPrices);
    });
  }
});
