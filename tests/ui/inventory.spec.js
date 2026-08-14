import { test, expect } from "../../fixtures/login.fixture";
import LoginPage from "../../pages/login.page";
import InventoryPage from "../../pages/inventory.page";
import users from "../../test-data/users-data";
import inventoryData from "../../test-data/inventory-data.json" with { type: "json" };
import { priceSortCases } from "../../test-data/inventory-sort-data";
import { CommonUtils } from "../../utils/common.utils";
import { loginData } from "../../test-data/login-page-data";

/** @type {LoginPage} */
let loginPage;
/** @type {InventoryPage} */
let inventoryPage;

test.describe("Inventory Tests @inventory", () => {
  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    inventoryPage = new InventoryPage(page);

    await loginPage.goto(loginData.loginPageUrl);
  });

  test(
    "should navigate to the inventory page after valid login",
    { tag: ["@smoke", "@inventory"] },
    async ({}) => {
      // Arrange
      const user = users.valid.standardUser;
      const inventory = inventoryData.basicData;

      // Act
      await loginPage.login(user);

      // Assert
      await expect(inventoryPage.pageTitle()).toHaveText(inventory.title);
    }
  );

  test("should display all available products", async ({}) => {
    // Arrange
    const user = users.valid.standardUser;
    const expectedNames = Object.values(inventoryData.productData).map(
      (product) => product.name
    );

    // Act
    await loginPage.login(user);

    // assert products counts first: as this auto waits
    await expect(inventoryPage.getInventoryCount).toHaveCount(
      expectedNames.length
    );

    // Assert count first to trigger auto-waiting before fetching the all products names.
    const actualNames = await inventoryPage.getAllProductNames();
    expect(actualNames).toEqual(expectedNames);
  });

  test("should display the correct product information", async ({
    loginUser: _loginUser,
  }) => {
    const expectedProductInfo = Object.values(inventoryData.productData);

    const expectedNames = expectedProductInfo.map((p) => p.name);
    const expectedPrices = expectedProductInfo.map((p) => p.price);
    const expectedDescriptions = expectedProductInfo.map((p) => p.description);

    await expect(inventoryPage.getInventoryCount).toHaveCount(
      expectedProductInfo.length
    );

    const actualNames = await inventoryPage.getAllProductNames();
    const actualPrices = await inventoryPage.getAllProductPrices();
    const actualDescriptions = await inventoryPage.getAllProductDescriptions();

    expect(actualNames).toEqual(expectedNames);
    expect(actualPrices).toEqual(expectedPrices);
    expect(actualDescriptions).toEqual(expectedDescriptions);
  });

  test("should add product to the cart", async ({ _loginUser, _page }) => {
    //arrange
    const productName = inventoryData.productData.backpack.name;

    //act
    await inventoryPage.addProductToCart(productName);

    //assert
    await expect(inventoryPage.cartProductCount()).toHaveCount(1);
  });

  // sorting without data-driven approach
  test("should sort products names in descending alphabetical order (Z to A)", async ({
    _loginUser,
    _page,
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

  // sorting by data driven approach
  for (const { sortOrder, direction, compare } of priceSortCases) {
    test(`should sort products ${direction}`, async ({ _loginUser, _page }) => {
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
