import { test, expect } from "../../fixtures/auth.fixture";
import inventoryData from "../../test-data/inventory-page.data.json" with { type: "json" };
import checkoutData from "../../test-data/checkout-page.data.json" with { type: "json" };
import paymentData from "../../test-data/payment-page.data.json" with { type: "json" };

/* Adds the given products to the cart and drives navigation through the cart
 * and checkout information pages to land on the checkout overview (payment)
 * page — payment/paymentPage does not goto() directly since it's a
 * click-through page (see fixtures/pages.fixture.js). */
async function goToPaymentPage(
  { inventoryPage, cartPage, checkoutPage },
  productNames
) {
  for (const productName of productNames) {
    await inventoryPage.addProductToCart(productName);
  }
  await inventoryPage.openCart();
  await cartPage.checkout();
  await checkoutPage.continueToOverview(checkoutData.validCustomer);
}

test.describe("Payment page", () => {
  test("should display the item quantities and descriptions matching the cart contents in the checkout overview", async ({
    inventoryPage,
    cartPage,
    checkoutPage,
    paymentPage,
  }) => {
    //arrange
    const { bikeLight, fleeceJacket } = inventoryData.productData;
    const expectedNames = [bikeLight.name, fleeceJacket.name];
    const expectedDescriptions = [
      bikeLight.description,
      fleeceJacket.description,
    ];

    //act
    await goToPaymentPage(
      { inventoryPage, cartPage, checkoutPage },
      expectedNames
    );

    //assert
    await expect(paymentPage.getCartItemCount).toHaveCount(
      expectedNames.length
    );

    const actualNames = await paymentPage.getAllProductNames();
    const actualDescriptions = await paymentPage.getAllProductDescriptions();

    expect(actualNames).toEqual(expectedNames);
    expect(actualDescriptions).toEqual(expectedDescriptions);

    await expect(paymentPage.productQuantity(bikeLight.name)).toHaveText("1");
    await expect(paymentPage.productQuantity(fleeceJacket.name)).toHaveText(
      "1"
    );
  });

  test("should display shipping information and the payment card masking placeholder", async ({
    inventoryPage,
    cartPage,
    checkoutPage,
    paymentPage,
  }) => {
    //arrange
    const productName = inventoryData.productData.backpack.name;

    //act
    await goToPaymentPage({ inventoryPage, cartPage, checkoutPage }, [
      productName,
    ]);

    //assert
    await expect(paymentPage.paymentInformation()).toHaveText(
      paymentData.paymentInfo
    );
    await expect(paymentPage.shippingInformation()).toHaveText(
      paymentData.shippingInfo
    );
  });

  test("should format the item total, tax, and grand total currencies correctly", async ({
    inventoryPage,
    cartPage,
    checkoutPage,
    paymentPage,
  }) => {
    //arrange :- single product avoids the known floating-point summation
    //defect covered separately below, keeping this test focused on formatting
    const productName = inventoryData.productData.backpack.name;

    //act
    await goToPaymentPage({ inventoryPage, cartPage, checkoutPage }, [
      productName,
    ]);

    //assert
    await expect(paymentPage.itemTotal()).toHaveText(
      /^Item total: \$\d+\.\d{2}$/
    );
    await expect(paymentPage.tax()).toHaveText(/^Tax: \$\d+\.\d{2}$/);
    await expect(paymentPage.total()).toHaveText(/^Total: \$\d+\.\d{2}$/);
  });

  test("should display the item total without floating-point rounding artifacts (e.g. 59.980000000000004)", async ({
    inventoryPage,
    cartPage,
    checkoutPage,
    paymentPage,
  }) => {
    // Known Sauce Demo defect: summing this exact product combination (Sauce
    // Labs Bike Light $9.99 + Sauce Labs Fleece Jacket $49.99) via JS
    // floating-point addition renders "Item total: $59.980000000000004"
    // instead of "Item total: $59.98". This test documents the expected,
    // bug-free behavior and is marked as an expected failure until the site
    // fixes the underlying calculation.
    test.fail();

    //arrange
    const { bikeLight, fleeceJacket } = inventoryData.productData;

    //act
    await goToPaymentPage({ inventoryPage, cartPage, checkoutPage }, [
      bikeLight.name,
      fleeceJacket.name,
    ]);

    //assert
    await expect(paymentPage.itemTotal()).toHaveText(
      /^Item total: \$\d+\.\d{2}$/
    );
  });
});
