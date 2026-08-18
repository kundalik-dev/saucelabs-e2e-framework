import { test, expect } from "../../fixtures/auth.fixture";
import inventoryData from "../../test-data/inventory-page.data.json" with { type: "json" };
import cartData from "../../test-data/cart-page.data.json" with { type: "json" };

test.describe("Cart", () => {
  test("should add single product to the cart", async ({ inventoryPage }) => {
    //arrange
    const productName = inventoryData.productData.backpack.name;

    //act
    await inventoryPage.addProductToCart(productName);

    //assert :- hard coded count as we are adding only one product to the cart
    await expect(inventoryPage.cartProductCount()).toHaveCount(1);
  });
});

test.describe("Cart page", () => {
  test("should display correct product names and prices for all items in the cart list", async ({
    inventoryPage,
    cartPage,
  }) => {
    //arrange
    const { backpack, bikeLight } = inventoryData.productData;
    const expectedNames = [backpack.name, bikeLight.name];
    const expectedPrices = [backpack.price, bikeLight.price];

    //act
    await inventoryPage.addProductToCart(backpack.name);
    await inventoryPage.addProductToCart(bikeLight.name);
    await inventoryPage.openCart();

    //assert
    await expect(cartPage.getCartItemCount).toHaveCount(expectedNames.length);

    const actualNames = await cartPage.getAllProductNames();
    const actualPrices = await cartPage.getAllProductPrices();

    expect(actualNames).toEqual(expectedNames);
    expect(actualPrices).toEqual(expectedPrices);
  });

  test("should verify 'Sauce Labs Backpack' quantity is 1 in the cart", async ({
    inventoryPage,
    cartPage,
  }) => {
    //arrange
    const productName = inventoryData.productData.backpack.name;

    //act
    await inventoryPage.addProductToCart(productName);
    await inventoryPage.openCart();

    //assert
    await expect(cartPage.productQuantity(productName)).toHaveText(
      cartData.defaultQuantity
    );
  });

  test("should display the cart page title as 'Your Cart'", async ({
    inventoryPage,
    cartPage,
  }) => {
    //arrange
    const productName = inventoryData.productData.backpack.name;

    //act
    await inventoryPage.addProductToCart(productName);
    await inventoryPage.openCart();

    //assert
    await expect(cartPage.pageTitle()).toHaveText(cartData.basicData.title);
  });

  test("should display 'Continue Shopping' and 'Checkout' buttons on the cart page", async ({
    inventoryPage,
    cartPage,
  }) => {
    //arrange
    const productName = inventoryData.productData.backpack.name;

    //act
    await inventoryPage.addProductToCart(productName);
    await inventoryPage.openCart();

    //assert
    await expect(cartPage.continueShoppingButton()).toHaveText(
      cartData.buttons.continueShopping
    );
    await expect(cartPage.checkoutButton()).toHaveText(
      cartData.buttons.checkout
    );
  });
});
