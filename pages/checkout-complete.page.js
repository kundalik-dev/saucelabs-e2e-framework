class CheckoutCompletePage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;

    // heading locator
    this.titleLoc = this.page.getByTestId("title");

    // confirmation locators
    this.checkmarkIconLoc = this.page.locator(".pony_express");
    this.completeHeaderLoc = this.page.getByTestId("complete-header");
    this.completeTextLoc = this.page.getByTestId("complete-text");

    // action locator
    this.backHomeBtnLoc = this.page.getByTestId("back-to-products");
  }

  pageTitle() {
    return this.titleLoc;
  }

  confirmationIcon() {
    return this.checkmarkIconLoc;
  }

  confirmationHeader() {
    return this.completeHeaderLoc;
  }

  confirmationText() {
    return this.completeTextLoc;
  }

  backHomeButton() {
    return this.backHomeBtnLoc;
  }

  async backHome() {
    await this.backHomeBtnLoc.click();
  }
}

export default CheckoutCompletePage;
