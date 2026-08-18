# 1. Login page test cases

## UI test cases

- should display all essential login elements when the login page loads
- should render responsively on mobile viewports
- should change the input border color to red when an error state is active
- should display the error container bar at the bottom of the form
- should login with valid credentials ✅
- should display an error message when a locked out user's credentials are entered ✅
- should display an error message when an invalid username is entered ✅
- should display an error message when an invalid password is entered ✅
- should clear the error message when clicking the close (X) button

## E2E test cases

- should prevent access to the inventory page when the user is not logged in
- should redirect to the login page after an explicit user logout

# 2. Inventory page test cases

## UI test cases

- should display the correct product information ✅
- should add a single product to the cart and update the badge count to 1 ✅
- should toggle the button text from 'Add to cart' to 'Remove' when a product is added and removed ✅
- should sort product names in descending alphabetical order (Z to A) ✅
- should sort product names in ascending alphabetical order (A to Z)
- should sort products by price from low to high ✅
- should sort products by price from high to low ✅
- should remove all products from the cart and ensure the badge is hidden
- should display matching images, titles, and prices for all inventory cards
- should retain added cart items after reloading the inventory page

## E2E test cases

- should open the detailed item view when clicking on a product title
- should maintain the cart badge count when navigating to the cart page and back to inventory

# 3. Cart page test cases

## UI test cases

- should display correct product names and prices for all items in the cart list ✅
- should verify 'Sauce Labs Backpack' quantity is 1 in the cart ✅
- should display the cart page title as 'Your Cart' ✅
- should display 'Continue Shopping' and 'Checkout' buttons on the cart page ✅
- should allow the user to remove an item directly from the cart page list

## E2E test cases

- should navigate to the checkout page when clicking the checkout button
- should navigate back to the inventory page when clicking the continue shopping button

# 4. Checkout page test cases

## UI test cases

- should highlight the input fields with error icons when validation fails
- should display placeholder text inside the first name, last name, and postal code inputs
- should show an error when required fields are empty
- should show a validation error when only the postal code field is missing
- should calculate the total price correctly

## E2E test cases

- should complete the full checkout process
- should navigate to the checkout overview page when clicking continue with valid information
- should return to the cart page when clicking cancel on the checkout information page

# 5. Payments page test cases

## UI test cases

- should format the item total, tax, and grand total currencies correctly ✅
- should display shipping information and the payment card masking placeholder ✅
- should display the item quantities and descriptions matching the cart contents in the checkout overview ✅
- should display the item total without floating-point rounding artifacts (e.g. 59.980000000000004) ✅

## E2E test cases

- should match the grand total mathematical sum of items plus calculated tax
- should return to the inventory page when clicking cancel on the checkout overview page

# 6. Order complete page test cases

## UI test cases

- should display the 'Checkout: Complete!' page title ✅
- should display the green checkmark confirmation icon ✅
- should display the 'Thank you for your order!' heading ✅
- should display the order dispatch confirmation message ✅
- should display the 'Back Home' button ✅

## E2E test cases

- should reach the order complete page after finishing the checkout overview
- should completely clear the shopping cart badge count after order completion
- should navigate to the inventory page when clicking the 'Back Home' button
