class PaymentPage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;

    // heading locator
    this.titleLoc = this.page.getByTestId("title");

    // cart item locators (same shape as CartPage — the overview reuses the item list markup)
    this.cartItemsLoc = this.page.locator(".cart_item");
    this.productNamesLoc = this.page.getByTestId("inventory-item-name");
    this.productPricesLoc = this.page.getByTestId("inventory-item-price");
    this.productDescriptionsLoc = this.page.getByTestId("inventory-item-desc");

    // payment / shipping / total locators
    this.paymentInfoLoc = this.page.getByTestId("payment-info-value");
    this.shippingInfoLoc = this.page.getByTestId("shipping-info-value");
    this.itemTotalLoc = this.page.getByTestId("subtotal-label");
    this.taxLoc = this.page.getByTestId("tax-label");
    this.totalLoc = this.page.getByTestId("total-label");

    // action locators
    this.finishBtnLoc = this.page.getByTestId("finish");
    this.cancelBtnLoc = this.page.getByTestId("cancel");
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

  paymentInformation() {
    return this.paymentInfoLoc;
  }

  shippingInformation() {
    return this.shippingInfoLoc;
  }

  itemTotal() {
    return this.itemTotalLoc;
  }

  tax() {
    return this.taxLoc;
  }

  total() {
    return this.totalLoc;
  }

  async finish() {
    await this.finishBtnLoc.click();
  }

  async cancel() {
    await this.cancelBtnLoc.click();
  }
}

export default PaymentPage;
