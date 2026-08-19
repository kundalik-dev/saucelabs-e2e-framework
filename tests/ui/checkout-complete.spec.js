import { test, expect } from "../../fixtures/auth.fixture";
import inventoryData from "../../test-data/inventory-page.data.json" with { type: "json" };
import checkoutData from "../../test-data/checkout-page.data.json" with { type: "json" };
import checkoutCompleteData from "../../test-data/checkout-complete-page.data.json" with { type: "json" };

test.describe("Checkout complete page", () => {
  /* Every test in this file needs the exact same setup: add a product, drive
   * the full checkout journey, and finish. checkoutCompletePage does not
   * goto() directly since it's a click-through page reached via
   * PaymentPage.finish() (see fixtures/pages.fixture.js). */

  // 🔴 check this step usiability
  test.beforeEach(
    async ({ inventoryPage, cartPage, checkoutPage, paymentPage }) => {
      const productName = inventoryData.productData.backpack.name;

      await inventoryPage.addProductToCart(productName);
      await inventoryPage.openCart();
      await cartPage.checkout();
      await checkoutPage.continueToOverview(checkoutData.validCustomer);
      await paymentPage.finish();
    }
  );

  test("should display the 'Checkout: Complete!' page title", async ({
    checkoutCompletePage,
  }) => {
    await expect(checkoutCompletePage.pageTitle()).toHaveText(
      checkoutCompleteData.basicData.title
    );
  });

  test("should display the green checkmark confirmation icon", async ({
    checkoutCompletePage,
  }) => {
    await expect(checkoutCompletePage.confirmationIcon()).toBeVisible();
  });

  test("should display the 'Thank you for your order!' heading", async ({
    checkoutCompletePage,
  }) => {
    await expect(checkoutCompletePage.confirmationHeader()).toHaveText(
      checkoutCompleteData.confirmationHeader
    );
  });

  test("should display the order dispatch confirmation message", async ({
    checkoutCompletePage,
  }) => {
    await expect(checkoutCompletePage.confirmationText()).toHaveText(
      checkoutCompleteData.confirmationText
    );
  });

  test("should display the 'Back Home' button", async ({
    checkoutCompletePage,
  }) => {
    await expect(checkoutCompletePage.backHomeButton()).toHaveText(
      checkoutCompleteData.backHomeButtonText
    );
  });

  test("should display cart badge with 0 items after clicking 'Back Home' button", async ({
    checkoutCompletePage,
    inventoryPage,
  }) => {
    // await checkoutCompletePage.backHomeButton().click();
    // await expect(inventoryPage.cartBadge()).toHaveText(
    //   checkoutCompleteData.cartBadgeAfterBackHome
    // );
  });
});
