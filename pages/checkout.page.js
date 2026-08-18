class CheckoutPage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;

    // heading locator
    this.titleLoc = this.page.getByTestId("title");

    // form locators
    this.firstNameLoc = this.page.getByTestId("firstName");
    this.lastNameLoc = this.page.getByTestId("lastName");
    this.postalCodeLoc = this.page.getByTestId("postalCode");

    // action locators
    this.continueBtnLoc = this.page.getByTestId("continue");
    this.cancelBtnLoc = this.page.getByTestId("cancel");

    // error locator (same pattern as LoginPage — same error component is reused)
    this.errorMsgLoc = this.page.getByRole("heading", { level: 3 });
  }

  pageTitle() {
    return this.titleLoc;
  }

  async fillInformation(customer) {
    await this.firstNameLoc.fill(customer.firstName);
    await this.lastNameLoc.fill(customer.lastName);
    await this.postalCodeLoc.fill(customer.postalCode);
  }

  async continueToOverview(customer) {
    await this.fillInformation(customer);
    await this.continueBtnLoc.click();
  }

  async cancel() {
    await this.cancelBtnLoc.click();
  }

  get getErrorMessage() {
    return this.errorMsgLoc;
  }
}

export default CheckoutPage;
