# 1. Login page test cases

## UI test cases

- should display all essential login elements when the login page load
- sshould render responsively on mobile viewports
- should change input border color to red when error state is active
- should display the error container bar at the bottom of the form

## E2E test cases

- should login with valid credentials
- should show error for locked_out_user
- should handle invalid user
- should clear error message when clicking X button
- should prevent access to inventory page when user is not logged in
- should redirect to login page after explicit user logout

# 2. Inventory page test cases

## UI test cases

- Should add a product and verify the badge count updates to 1
- Should remove all products and ensure the badge is hidden
- Should display matching images, titles, and prices for all inventory cards
- Should toggle button text from 'Add to cart' to 'Remove' upon selection
- Should maintain badge count when user navigates away and returns to inventory
- Should remove all products and ensure the badge is hidden

## E2E test cases

- Should sort products in descending alphabetical order (A to Z)
- Should sort products in descending alphabetical order (Z to A)
- Should sort products in ascending price order (low to high)
- Should sort products in descending price order (high to low)
- Should open the detailed item view when clicking on a product title
- Should retain added cart items after reloading the inventory page

# 3. Cart page test cases

## UI test cases

- Should display correct product names and prices for all items in the cart list
- Should verify 'Sauce Labs Backpack' quantity is 1 in the cart

## E2E test cases

- Should navigate to the checkout page when clicking checkout button
- Should allow user to remove an item directly from the cart page list
- Should navigate back to inventory page when clicking continue shopping button

# 4. Checkout page test cases

## UI test cases

- Should verify 'Sauce Labs Backpack' quantity is 1 in the cart
- Should highlight text fields with error icons when validation fails
- Should display placeholder text inside first name, last name, and postal code inputs

## E2E test cases

- should complete full checkout process
- should show error when required fields are empty
- should calculate total price correctly
- should allow user to cancel checkout
- should show validation error when only postal code field is missing

# 4. Payments page test cases

## UI test cases

- Should format item total, tax, and grand total currencies correctly
- Should display shipping information and payment card masking placeholder

## E2E test cases

- Should match the grand total mathematical sum of items plus calculated tax
- Should display the 'Thank you for your order!' confirmation screen upon finishing
- Should completely clear the shopping cart badge count after order completion
