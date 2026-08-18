import { test, expect } from "../../fixtures/login.fixture";
import InventoryPage from "../../pages/inventory.page";
import inventoryData from "../../test-data/inventory-page.data.json" with { type: "json" };

test.describe("Cart", () => {
  test.use({
    storageState: "./auth/storageState.json",
  });

  test("should add single product to the cart", async ({ page }) => {
    //arrange
    const inventoryPage = new InventoryPage(page);
    const productName = inventoryData.productData.backpack.name;

    //act
    await inventoryPage.goto(inventoryData.basicData.pageUrl);
    await inventoryPage.addProductToCart(productName);

    //assert :- hard coded count as we are adding only one product to the cart
    await expect(inventoryPage.cartProductCount()).toHaveCount(1);
  });
});
