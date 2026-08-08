class LoginPage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;
    this.username = this.page.getByRole("textbox", { name: "Username" });
    this.password = this.page.getByRole("textbox", { name: "Password" });
    this.loginButton = this.page.getByRole("button", { name: "Login" });

    // Error message
    this.errorMsg = this.page.getByRole("heading", { level: 3 });
  }

  async goto(url) {
    await this.page.goto(url);
  }

  async login(user) {
    await this.username.fill(user.username);
    await this.password.fill(user.password);
    await this.loginButton.click();
  }
}
export default LoginPage;
