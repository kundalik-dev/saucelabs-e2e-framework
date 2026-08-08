class InventoryPage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;
    this.title_loc = this.page.getByTestId("title");
    this.productName_loc = this.page;
    this.inventoryItems_loc = this.page.locator(".inventory_item");
    this.productNames_loc = this.page.getByTestId("inventory-item-name");
    this.productPrices_loc = this.page.getByTestId("inventory-item-price");
    this.productDescriptions_loc = this.page.getByTestId("inventory-item-desc");
    this.addToCart_loc = this.page.getByText("Add to cart");
  }

  async getAllProductNames() {
    return await this.productNames_loc.allTextContents();
  }

  async getAllProductPrices() {
    return await this.productPrices_loc.allTextContents();
  }

  async getAllProductsDescriptions() {
    return await this.productDescriptions_loc.allTextContents();
  }

  addProductToCart(productName) {
    return this.inventoryItems_loc
      .filter({ hasText: productName })
      .locator("button");
  }
}

export default InventoryPage;
