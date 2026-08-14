class InventoryPage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;

    // heading locator
    this.title_loc = this.page.getByTestId("title");

    // product locator
    this.inventoryItems_loc = this.page.locator(".inventory_item");
    this.productNames_loc = this.page.getByTestId("inventory-item-name");
    this.productPrices_loc = this.page.getByTestId("inventory-item-price");
    this.productDescriptions_loc = this.page.getByTestId("inventory-item-desc");

    // cart locator
    this.addToCart_loc = this.page.getByText("Add to cart");
    this.cartBadge_loc = this.page.getByTestId("shopping-cart-badge");

    // sort locator
    this.sortDropdown_loc = this.page.getByTestId("product-sort-container");

    //footer Locators
  }

  pageTitle() {
    return this.title_loc;
  }

  async getAllProductNames() {
    return await this.productNames_loc.allTextContents();
  }

  getFirstProductName() {
    return this.productNames_loc.first();
  }

  getFirstProductPrice() {
    return this.productPrices_loc.first();
  }
  async getAllProductPrices() {
    return await this.productPrices_loc.allTextContents();
  }

  getInventoryCount() {
    return this.inventoryItems_loc;
  }

  cartProductCount() {
    return this.cartBadge_loc;
  }

  async getAllProductDescriptions() {
    return await this.productDescriptions_loc.allTextContents();
  }

  async addProductToCart(productName) {
    await this.inventoryItems_loc
      .filter({ hasText: productName })
      .locator("button")
      .click();
  }

  async removeProductFromCart() {}

  async selectSortOrder(sortOrder) {
    await this.sortDropdown_loc.selectOption({ value: sortOrder });
  }
}

export default InventoryPage;
