| ID      | Test case name                                                        | What it should verify                                                                      |
| ------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| INV-001 | **should display the inventory page after successful login**          | User is redirected to `/inventory.html` and the Products heading is displayed.             |
| INV-002 | **should display all available products**                             | Expected product cards are displayed with product name, price, and image.                  |
| INV-003 | **should display the correct product information**                    | Each product has the expected name, description, and price.                                |
| INV-004 | **should add a product to the cart**                                  | Selected product is added and cart badge shows `1`.                                        |
| INV-005 | **should add multiple products to the cart**                          | Selected products are added and cart badge matches the number of products added.           |
| INV-006 | **should remove a product from the cart from the inventory page**     | Selected product is removed and cart count is decremented/cleared appropriately.           |
| INV-007 | **should add a product again after removing it**                      | Product can be added after being removed and cart state is correct.                        |
| INV-008 | **should display the selected product in the cart**                   | Product added from inventory appears in the cart with the correct name and price.          |
| INV-009 | **should sort products by name in ascending order**                   | Products are displayed alphabetically from A → Z.                                          |
| INV-010 | **should sort products by name in descending order**                  | Products are displayed alphabetically from Z → A.                                          |
| INV-011 | **should sort products by price in ascending order**                  | Product prices are displayed from lowest → highest.                                        |
| INV-012 | **should sort products by price in descending order**                 | Product prices are displayed from highest → lowest.                                        |
| INV-013 | **should open the correct product details**                           | Clicking a product opens its detail page with the correct product information.             |
| INV-014 | **should add a product to the cart from the product details page**    | Selected product is added and cart badge is updated correctly.                             |
| INV-015 | **should return to the inventory page from the product details page** | Back to Products navigation returns to inventory with the expected state.                  |
| INV-016 | **should retain the cart state after refreshing the inventory page**  | Previously added products remain in the expected cart state after refresh.                 |
| INV-017 | **should add all available products to the cart**                     | All products can be added and cart count equals the total number of products.              |
| INV-018 | **should remove all products from the cart**                          | All selected products can be removed and the cart returns to an empty state.               |
| INV-019 | **should prevent unauthenticated access to the inventory page**       | Direct navigation to `/inventory.html` without authentication redirects the user to login. |
| INV-020 | **should prevent access to the inventory page after logout**          | After logout, the user cannot access inventory directly.                                   |
