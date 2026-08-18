class CartPage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;

    // heading locator
    this.titleLoc = this.page.getByTestId("title");

    // cart item locators
    this.cartItemsLoc = this.page.locator(".cart_item");
    this.productNamesLoc = this.page.getByTestId("inventory-item-name");
    this.productPricesLoc = this.page.getByTestId("inventory-item-price");
    this.productDescriptionsLoc = this.page.getByTestId("inventory-item-desc");
    this.productQuantitiesLoc = this.page.getByTestId("item-quantity");

    // action locators
    this.continueShoppingBtnLoc = this.page.getByTestId("continue-shopping");
    this.checkoutBtnLoc = this.page.getByTestId("checkout");
  }

  async goto(pageUrl) {
    await this.page.goto(pageUrl);
  }

  pageTitle() {
    return this.titleLoc;
  }

  get getCartItemCount() {
    return this.cartItemsLoc;
  }

  async getAllProductNames() {
    return await this.productNamesLoc.allTextContents();
  }

  async getAllProductPrices() {
    return await this.productPricesLoc.allTextContents();
  }

  async getAllProductDescriptions() {
    return await this.productDescriptionsLoc.allTextContents();
  }

  productQuantity(productName) {
    return this.cartItemsLoc
      .filter({ hasText: productName })
      .getByTestId("item-quantity");
  }

  async removeProductFromCart(productName) {
    await this.cartItemsLoc
      .filter({ hasText: productName })
      .getByRole("button", { name: "Remove" })
      .click();
  }

  continueShoppingButton() {
    return this.continueShoppingBtnLoc;
  }

  checkoutButton() {
    return this.checkoutBtnLoc;
  }
}

export default CartPage;
