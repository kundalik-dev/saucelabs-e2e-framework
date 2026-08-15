import { test, expect } from "../../fixtures/login.fixture";
import InventoryPage from "../../pages/inventory.page";
import inventoryData from "../../test-data/inventory-data.json" with { type: "json" };
import {
  priceSortCases,
  nameSortCases,
} from "../../test-data/inventory-sort-data";
import { CommonUtils } from "../../utils/common.utils";

test.describe("Inventory", () => {
  test("should display all available products", async ({
    loginFixture,
    page,
  }) => {
    // Arrange
    const inventoryPage = new InventoryPage(page);

    // Act
    const expectedNames = Object.values(inventoryData.productData).map(
      (product) => product.name
    );
    // check products count - as this has auto waits
    await expect(inventoryPage.getInventoryCount).toHaveCount(
      expectedNames.length
    );

    // Get all products names
    const actualNames = await inventoryPage.getAllProductNames();
    expect(actualNames).toEqual(expectedNames);
  });

  test("should display the correct product information", async ({
    loginFixture,
    page,
  }) => {
    const inventoryPage = new InventoryPage(page);
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

  test("should add single product to the cart", async ({
    loginFixture,
    page,
  }) => {
    //arrange
    const inventoryPage = new InventoryPage(page);
    const productName = inventoryData.productData.backpack.name;

    //act
    await inventoryPage.addProductToCart(productName);

    //assert :- hard coded count as we are adding only one product to the cart
    await expect(inventoryPage.cartProductCount()).toHaveCount(1);
  });

  // sorting without data-driven approach
  test("should sort products names in descending alphabetical order (Z to A)", async ({
    loginFixture,
    page,
  }) => {
    //arrange
    const inventoryPage = new InventoryPage(page);

    const sortOrder = nameSortCases[1].sortOrder;
    const compareLogic = nameSortCases[1].compare;
    console.log(
      `Sorting products by: ${sortOrder} with compare logic: ${compareLogic}`
    );

    //act
    const productNames = await inventoryPage.getAllProductNames();
    const expectedNames = [...productNames].sort(compareLogic);

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
    test(`should sort products ${direction}`, async ({
      loginFixture,
      page,
    }) => {
      // Arrange
      const inventoryPage = new InventoryPage(page);

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
