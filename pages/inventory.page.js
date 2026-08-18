class InventoryPage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;

    // heading locator
    this.titleLoc = this.page.getByTestId("title");
    this.pageFooterLoc = this.page.getByTestId("footer");

    // product locator
    this.inventoryItemsLoc = this.page.locator(".inventory_item");
    this.productNamesLoc = this.page.getByTestId("inventory-item-name");
    this.productPricesLoc = this.page.getByTestId("inventory-item-price");
    this.productDescriptionsLoc = this.page.getByTestId("inventory-item-desc");

    // cart locator
    this.addToCartLoc = this.page.getByText("Add to cart");
    this.cartBadgeLoc = this.page.getByTestId("shopping-cart-badge");
    this.cartLinkLoc = this.page.getByTestId("shopping-cart-link");

    // sort locator
    this.sortDropdownLoc = this.page.getByTestId("product-sort-container");

    // menu locator
    this.menuBtnLoc = this.page.getByTestId("open-menu");
    this.logoutLinkLoc = this.page.getByTestId("logout-sidebar-link");
  }

  async goto(pageUrl) {
    await this.page.goto(pageUrl);
  }

  pageTitle() {
    return this.titleLoc;
  }

  async getAllProductNames() {
    return await this.productNamesLoc.allTextContents();
  }

  getFirstProductName() {
    return this.productNamesLoc.first();
  }

  getFirstProductPrice() {
    return this.productPricesLoc.first();
  }
  async getAllProductPrices() {
    return await this.productPricesLoc.allTextContents();
  }

  get getInventoryCount() {
    return this.inventoryItemsLoc;
  }

  cartProductCount() {
    return this.cartBadgeLoc;
  }

  // navigates to the cart page via the header cart icon (click-through entry point)
  async openCart() {
    await this.cartLinkLoc.click();
  }

  async getAllProductDescriptions() {
    return await this.productDescriptionsLoc.allTextContents();
  }

  async addProductToCart(productName) {
    await this.inventoryItemsLoc
      .filter({ hasText: productName })
      .first()
      .getByRole("button", { name: "Add to cart" })
      .click();
  }

  async removeProductFromCart(productName) {
    await this.inventoryItemsLoc
      .filter({ hasText: productName })
      .getByRole("button", { name: "Remove" })
      .click();
  }

  productButton(productName) {
    return this.inventoryItemsLoc
      .filter({ hasText: productName })
      .getByRole("button");
  }

  async selectSortOrder(sortOrder) {
    await this.sortDropdownLoc.selectOption({ value: sortOrder });
  }

  // opens the header hamburger menu and logs out, landing back on the login page
  async logout() {
    await this.menuBtnLoc.click();
    await this.logoutLinkLoc.click();
  }
}

export default InventoryPage;
