class LoginPage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;

    // login locators
    this.usernameLoc = this.page.getByRole("textbox", { name: "Username" });
    this.passwordLoc = this.page.getByRole("textbox", { name: "Password" });
    this.loginButtonLoc = this.page.getByRole("button", { name: "Login" });

    // Error message
    this.errorMsgLoc = this.page.getByRole("heading", { level: 3 });
  }

  async goto(url) {
    await this.page.goto(url);
  }

  async login(user) {
    await this.usernameLoc.fill(user.username);
    await this.passwordLoc.fill(user.password);
    await this.loginButtonLoc.click();
  }

  // getter for error message returns the error message locator
  get getErrorMessage() {
    return this.errorMsgLoc;
  }
}
export default LoginPage;
