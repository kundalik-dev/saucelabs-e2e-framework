import { test, expect } from "../../fixtures/auth.fixture";
import LoginPage from "../../pages/login.page";
import InventoryPage from "../../pages/inventory.page";
import CartPage from "../../pages/cart.page";
import CheckoutPage from "../../pages/checkout.page";
import inventoryData from "../../test-data/inventory-page.data.json" with { type: "json" };
import checkoutData from "../../test-data/checkout-page.data.json" with { type: "json" };
import checkoutCompleteData from "../../test-data/checkout-complete-page.data.json" with { type: "json" };
import users from "../../test-data/users.data";

/* Drives navigation through the cart and checkout information pages to land
 * on the checkout overview (payment) page — cartPage/checkoutPage/paymentPage
 * do not goto() directly since they're click-through pages (see
 * fixtures/pages.fixture.js). Products must already be in the cart. */
async function goToPaymentPage({ inventoryPage, cartPage, checkoutPage }) {
  await inventoryPage.openCart();
  await cartPage.checkout();
  await checkoutPage.continueToOverview(checkoutData.validCustomer);
}

test.describe("Checkout @e2e - happy path", () => {
  test("should complete order for a single product (E2E-01) @smoke @critical", async ({
    inventoryPage,
    cartPage,
    checkoutPage,
    paymentPage,
    checkoutCompletePage,
  }) => {
    //arrange
    const productName = inventoryData.productData.backpack.name;

    //act
    await inventoryPage.addProductToCart(productName);
    await goToPaymentPage({ inventoryPage, cartPage, checkoutPage });

    //assert :- single product carried through to the overview page
    await expect(paymentPage.getCartItemCount).toHaveCount(1);
    const actualNames = await paymentPage.getAllProductNames();
    expect(actualNames).toEqual([productName]);

    //act
    await paymentPage.finish();

    //assert :- order placed
    await expect(checkoutCompletePage.pageTitle()).toHaveText(
      checkoutCompleteData.basicData.title
    );
    await expect(checkoutCompletePage.confirmationHeader()).toHaveText(
      checkoutCompleteData.confirmationHeader
    );
  });

  test("should complete order for multiple products (E2E-02) @critical", async ({
    inventoryPage,
    cartPage,
    checkoutPage,
    paymentPage,
    checkoutCompletePage,
  }) => {
    //arrange
    const { backpack, bikeLight, fleeceJacket } = inventoryData.productData;
    const expectedNames = [backpack.name, bikeLight.name, fleeceJacket.name];

    //act
    for (const productName of expectedNames) {
      await inventoryPage.addProductToCart(productName);
    }
    await goToPaymentPage({ inventoryPage, cartPage, checkoutPage });

    //assert :- all selected products carried through to the overview page
    await expect(paymentPage.getCartItemCount).toHaveCount(
      expectedNames.length
    );
    const actualNames = await paymentPage.getAllProductNames();
    expect(actualNames).toEqual(expectedNames);

    //act
    await paymentPage.finish();

    //assert :- order placed
    await expect(checkoutCompletePage.confirmationHeader()).toHaveText(
      checkoutCompleteData.confirmationHeader
    );
  });

  test("should complete order for the remaining product after removing an item in the cart (E2E-03) @regression", async ({
    inventoryPage,
    cartPage,
    checkoutPage,
    paymentPage,
    checkoutCompletePage,
  }) => {
    //arrange
    const { backpack, bikeLight } = inventoryData.productData;

    //act :- add two products, then remove one directly from the cart page
    await inventoryPage.addProductToCart(backpack.name);
    await inventoryPage.addProductToCart(bikeLight.name);
    await inventoryPage.openCart();
    await cartPage.removeProductFromCart(bikeLight.name);

    //assert :- only the remaining product is left in the cart
    await expect(cartPage.getCartItemCount).toHaveCount(1);
    const remainingNames = await cartPage.getAllProductNames();
    expect(remainingNames).toEqual([backpack.name]);

    //act
    await cartPage.checkout();
    await checkoutPage.continueToOverview(checkoutData.validCustomer);

    //assert :- only the remaining product reaches the overview page
    await expect(paymentPage.getCartItemCount).toHaveCount(1);
    const overviewNames = await paymentPage.getAllProductNames();
    expect(overviewNames).toEqual([backpack.name]);

    //act
    await paymentPage.finish();

    //assert :- order placed
    await expect(checkoutCompletePage.confirmationHeader()).toHaveText(
      checkoutCompleteData.confirmationHeader
    );
  });

  test("should complete order for the newly selected product after changing product selection (E2E-04) @regression", async ({
    inventoryPage,
    cartPage,
    checkoutPage,
    paymentPage,
    checkoutCompletePage,
  }) => {
    //arrange
    const { backpack, bikeLight } = inventoryData.productData;

    //act :- add product A, remove it from the inventory page, then add product B
    await inventoryPage.addProductToCart(backpack.name);
    await inventoryPage.removeProductFromCart(backpack.name);
    await inventoryPage.addProductToCart(bikeLight.name);

    //assert :- only product B is queued up in the cart badge
    await expect(inventoryPage.cartProductCount()).toHaveText("1");

    await goToPaymentPage({ inventoryPage, cartPage, checkoutPage });

    //assert :- only product B reaches the overview page
    await expect(paymentPage.getCartItemCount).toHaveCount(1);
    const overviewNames = await paymentPage.getAllProductNames();
    expect(overviewNames).toEqual([bikeLight.name]);

    //act
    await paymentPage.finish();

    //assert :- order placed
    await expect(checkoutCompletePage.confirmationHeader()).toHaveText(
      checkoutCompleteData.confirmationHeader
    );
  });

  test("should purchase both products when continuing shopping before checkout (E2E-05) @regression", async ({
    inventoryPage,
    cartPage,
    checkoutPage,
    paymentPage,
    checkoutCompletePage,
  }) => {
    //arrange
    const { backpack, bikeLight } = inventoryData.productData;

    //act :- add the first product, return to shopping from the cart, then add the second
    await inventoryPage.addProductToCart(backpack.name);
    await inventoryPage.openCart();
    await cartPage.continueShoppingButton().click();
    await inventoryPage.addProductToCart(bikeLight.name);

    await goToPaymentPage({ inventoryPage, cartPage, checkoutPage });

    //assert :- both products reach the overview page
    await expect(paymentPage.getCartItemCount).toHaveCount(2);
    const overviewNames = await paymentPage.getAllProductNames();
    expect(overviewNames).toEqual([backpack.name, bikeLight.name]);

    //act
    await paymentPage.finish();

    //assert :- order placed
    await expect(checkoutCompletePage.confirmationHeader()).toHaveText(
      checkoutCompleteData.confirmationHeader
    );
  });

  test("should keep the cart intact when navigating back from the checkout information page (E2E-06) @regression", async ({
    inventoryPage,
    cartPage,
    checkoutPage,
    paymentPage,
    checkoutCompletePage,
    page,
  }) => {
    //arrange
    const productName = inventoryData.productData.backpack.name;

    //act :- add a product, reach checkout, then use the browser back button
    await inventoryPage.addProductToCart(productName);
    await inventoryPage.openCart();
    await cartPage.checkout();
    await page.goBack();

    //assert :- back on the cart page with the product still present
    await expect(cartPage.getCartItemCount).toHaveCount(1);
    const remainingNames = await cartPage.getAllProductNames();
    expect(remainingNames).toEqual([productName]);

    //act :- re-enter checkout and finish
    await cartPage.checkout();
    await checkoutPage.continueToOverview(checkoutData.validCustomer);

    //assert :- the same product reaches the overview page
    const overviewNames = await paymentPage.getAllProductNames();
    expect(overviewNames).toEqual([productName]);

    //act
    await paymentPage.finish();

    //assert :- order placed
    await expect(checkoutCompletePage.confirmationHeader()).toHaveText(
      checkoutCompleteData.confirmationHeader
    );
  });

  test("should resume and complete the purchase after cancelling checkout (E2E-07) @regression", async ({
    inventoryPage,
    cartPage,
    checkoutPage,
    paymentPage,
    checkoutCompletePage,
  }) => {
    //arrange
    const productName = inventoryData.productData.backpack.name;

    //act :- add a product, reach checkout, then cancel back to the cart
    await inventoryPage.addProductToCart(productName);
    await inventoryPage.openCart();
    await cartPage.checkout();
    await checkoutPage.cancel();

    //assert :- back on the cart page with the product still present
    await expect(cartPage.getCartItemCount).toHaveCount(1);

    //act :- re-enter checkout and finish
    await cartPage.checkout();
    await checkoutPage.continueToOverview(checkoutData.validCustomer);
    await paymentPage.finish();

    //assert :- order placed
    await expect(checkoutCompletePage.confirmationHeader()).toHaveText(
      checkoutCompleteData.confirmationHeader
    );
  });

  test("should complete the purchase of the top sorted product (E2E-08) @regression", async ({
    inventoryPage,
    cartPage,
    checkoutPage,
    paymentPage,
    checkoutCompletePage,
  }) => {
    //arrange
    const sortOrder = inventoryData.sortOrder.price.asc;

    //act :- sort products low to high, then add whichever product lands first
    await inventoryPage.selectSortOrder(sortOrder);
    const productName = await inventoryPage.getFirstProductName().textContent();
    await inventoryPage.addProductToCart(productName);

    await goToPaymentPage({ inventoryPage, cartPage, checkoutPage });

    //assert :- the sorted product reaches the overview page
    const overviewNames = await paymentPage.getAllProductNames();
    expect(overviewNames).toEqual([productName]);

    //act
    await paymentPage.finish();

    //assert :- order placed
    await expect(checkoutCompletePage.confirmationHeader()).toHaveText(
      checkoutCompleteData.confirmationHeader
    );
  });
});

test.describe("Checkout @e2e - anonymous users", () => {
  /* Overrides auth.fixture's default storageState so these tests run with no
   * session, matching the pattern in tests/e2e/auth.spec.js. */
  test.use({ storageState: { cookies: [], origins: [] } });

  test("should prevent a locked-out user from entering the purchase flow (E2E-09) @regression", async ({
    loginPage,
    page,
  }) => {
    //arrange
    const user = users.invalid.lockedOutUser;

    //act
    await loginPage.login(user);

    //assert :- rejected at login, never reaches the inventory/purchase flow
    await expect(loginPage.getErrorMessage).toHaveText(user.errorMsg);
    await expect(page).not.toHaveURL(/inventory\.html/);
  });

  test("should hit the known checkout information defect when purchasing as problem_user (E2E-12) @regression", async ({
    loginPage,
    page,
  }) => {
    //arrange
    const user = users.invalid.problemUser;
    const productName = inventoryData.productData.backpack.name;
    const inventoryPage = new InventoryPage(page);
    const cartPage = new CartPage(page);
    const checkoutPage = new CheckoutPage(page);

    //act :- problem_user can log in and add to cart, but the checkout
    //information form has a known defect: the first/last name fields collide,
    //so a required-field validation error blocks the purchase.
    await loginPage.login(user);
    await inventoryPage.addProductToCart(productName);
    await inventoryPage.openCart();
    await cartPage.checkout();
    await checkoutPage.continueToOverview(checkoutData.validCustomer);

    //assert :- the flow is blocked on the checkout information page
    await expect(page).toHaveURL(checkoutData.basicData.pageUrl);
    await expect(checkoutPage.getErrorMessage).toHaveText(
      checkoutData.errorMessages.missingLastName
    );
  });
});

test.describe("Checkout @e2e - session behavior", () => {
  test("should keep the cart contents after logging out and back in mid-shopping (E2E-10) @regression", async ({
    inventoryPage,
    page,
  }) => {
    //arrange
    const productName = inventoryData.productData.backpack.name;
    const loginPage = new LoginPage(page);

    //act :- add a product, log out, then log back in without re-adding it
    await inventoryPage.addProductToCart(productName);
    await expect(inventoryPage.cartProductCount()).toHaveText("1");

    await inventoryPage.logout();
    await loginPage.login(users.valid.standardUser);

    //assert :- the cart persists across the logout/login cycle
    await expect(page).toHaveURL(/inventory\.html/);
    await expect(inventoryPage.cartProductCount()).toHaveText("1");
  });

  test("should keep the purchase flow consistent across browser refreshes (E2E-11) @regression", async ({
    inventoryPage,
    cartPage,
    checkoutPage,
    paymentPage,
    checkoutCompletePage,
    page,
  }) => {
    //arrange
    const productName = inventoryData.productData.backpack.name;

    //act
    await inventoryPage.addProductToCart(productName);
    await inventoryPage.openCart();
    await page.reload();

    //assert :- cart contents survive the refresh
    await expect(cartPage.getCartItemCount).toHaveCount(1);

    //act
    await cartPage.checkout();
    await page.reload();

    //assert :- checkout information page survives the refresh
    await expect(checkoutPage.pageTitle()).toHaveText(
      checkoutData.basicData.title
    );

    await checkoutPage.continueToOverview(checkoutData.validCustomer);
    await paymentPage.finish();

    //assert :- order placed
    await expect(checkoutCompletePage.confirmationHeader()).toHaveText(
      checkoutCompleteData.confirmationHeader
    );
  });

  test("should purchase the final cart contents after modifying the cart at the checkout stage (E2E-13) @regression", async ({
    inventoryPage,
    cartPage,
    checkoutPage,
    paymentPage,
    checkoutCompletePage,
  }) => {
    //arrange
    const { backpack, bikeLight } = inventoryData.productData;

    //act :- add two products and reach checkout, then back out and modify the cart
    await inventoryPage.addProductToCart(backpack.name);
    await inventoryPage.addProductToCart(bikeLight.name);
    await inventoryPage.openCart();
    await cartPage.checkout();
    await checkoutPage.cancel();
    await cartPage.removeProductFromCart(bikeLight.name);

    //assert :- only the remaining product is left in the cart
    await expect(cartPage.getCartItemCount).toHaveCount(1);

    //act :- checkout again with the modified cart
    await cartPage.checkout();
    await checkoutPage.continueToOverview(checkoutData.validCustomer);

    //assert :- only the final cart contents reach the overview page
    const overviewNames = await paymentPage.getAllProductNames();
    expect(overviewNames).toEqual([backpack.name]);

    //act
    await paymentPage.finish();

    //assert :- order placed
    await expect(checkoutCompletePage.confirmationHeader()).toHaveText(
      checkoutCompleteData.confirmationHeader
    );
  });

  test("should complete two sequential purchases (E2E-14) @regression", async ({
    inventoryPage,
    cartPage,
    checkoutPage,
    paymentPage,
    checkoutCompletePage,
  }) => {
    //arrange
    const { backpack, bikeLight } = inventoryData.productData;

    //act :- purchase product A
    await inventoryPage.addProductToCart(backpack.name);
    await goToPaymentPage({ inventoryPage, cartPage, checkoutPage });
    await paymentPage.finish();

    //assert :- first order placed
    await expect(checkoutCompletePage.confirmationHeader()).toHaveText(
      checkoutCompleteData.confirmationHeader
    );

    //act :- return to products and purchase product B
    await checkoutCompletePage.backHome();
    await inventoryPage.addProductToCart(bikeLight.name);
    await goToPaymentPage({ inventoryPage, cartPage, checkoutPage });
    await paymentPage.finish();

    //assert :- second order placed
    await expect(checkoutCompletePage.confirmationHeader()).toHaveText(
      checkoutCompleteData.confirmationHeader
    );
  });

  test("should complete the full customer journey from browsing to logout (E2E-15) @critical", async ({
    inventoryPage,
    cartPage,
    checkoutPage,
    paymentPage,
    checkoutCompletePage,
    page,
  }) => {
    //arrange
    const expectedProductCount = Object.keys(inventoryData.productData).length;
    const { backpack, bikeLight } = inventoryData.productData;

    //act & assert :- browse products
    await expect(inventoryPage.getInventoryCount).toHaveCount(
      expectedProductCount
    );

    //act & assert :- view a product's detail page, then return
    await inventoryPage.getFirstProductName().click();
    await expect(page).toHaveURL(/inventory-item\.html/);
    await page.goBack();
    await expect(page).toHaveURL(/inventory\.html/);

    //act :- add products, then modify the cart
    await inventoryPage.addProductToCart(backpack.name);
    await inventoryPage.addProductToCart(bikeLight.name);
    await inventoryPage.openCart();
    await cartPage.removeProductFromCart(bikeLight.name);

    //assert :- only the remaining product is left in the cart
    await expect(cartPage.getCartItemCount).toHaveCount(1);

    //act :- checkout and verify order completion
    await cartPage.checkout();
    await checkoutPage.continueToOverview(checkoutData.validCustomer);
    await paymentPage.finish();

    await expect(checkoutCompletePage.confirmationHeader()).toHaveText(
      checkoutCompleteData.confirmationHeader
    );

    //act :- return to products, then log out
    await checkoutCompletePage.backHome();
    await inventoryPage.logout();

    //assert :- back on the login page
    await expect(page).toHaveURL(/saucedemo\.com\/$/);
  });
});
