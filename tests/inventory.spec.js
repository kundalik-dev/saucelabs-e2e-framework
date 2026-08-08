import test from "@playwright/test";
import users from "../data/users";

// Inventory tests
test.describe("Inventory test", () => {
  test(
    "should navigate to the inventory page after login",
    { tag: ["@smoke", "@inventory"] },
    async ({ page }) => {
      // Arrange
      const user = users.valid.standard_user;
      
      await page.goto("/");
      await page
        .getByRole("textbox", { name: "Username" })
        .fill(users.valid.standard_user.username);

      await page
        .getByRole("textbox", { name: "Password" })
        .fill(users.valid.standard_user.passsword);
    },
  );
});
