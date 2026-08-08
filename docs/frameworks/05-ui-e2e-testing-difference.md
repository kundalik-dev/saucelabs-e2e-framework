# Notes

# what is difference between e2e and ui test cases in automation testing

## Core Difference

The main difference lies in scope.

- UI testing checks if the visual elements look and work correctly.
- E2E (End-to-End) testing checks if the entire business flow works from start to finish.
- If server response in involved then make it as E2E tests.
- Use the UI layer strictly for front-end behavior and layouts

## UI Testing

UI (User Interface) testing focuses strictly on the visual and interactive elements of the application.

- Scope: Limited to the presentation layer.
- Goal: Verifies buttons, fields, fonts, colors, and layouts.
- Dependencies: Often uses mocked data or isolated environments.
- Speed: Relatively fast to execute.
- Example: Checking if a login button turns gray when disabled.

## E2E Testing

E2E testing simulates a real user's journey through the entire software stack.

- Scope: Covers frontend, backend, databases, APIs, and hardware.
- Goal: Verifies complete data integrity and system integration.
- Dependencies: Requires a fully functional, production-like environment.
- Speed: Slow due to network calls and data processing.
- Example: Logging in, buying an item, and verifying the database updates.

## Comparison Table

| Feature        | UI Testing          | E2E Testing                             |
| -------------- | ------------------- | --------------------------------------- |
| Focus          | Look and feel       | Business logic and workflow             |
| Environment    | Isolated / Mocked   | Complete integrated system              |
| Execution Time | Fast                | Slow                                    |
| Flakiness      | Low to Medium       | High (due to network/data dependencies) |
| Cost           | Cheaper to maintain | Expensive to build and maintain         |

---

## UI Test Case Examples

UI tests focus on the visual elements, layout, and immediate interactions on the page without worrying about the backend database or full user journeys.

## 1. Login Page Layout

- Objective: Verify that all essential login elements are visible and correctly aligned.
- Steps:

1. Navigate to https://saucedemo.com
2. Check that the logo "Swag Labs" is visible.
3. Verify the username input field is displayed.
4. Verify the password input field is displayed.
5. Verify the "Login" button is displayed.

- Expected Result: All elements are present, properly aligned, and match the design specifications.

## 2. Error Message Visual Validation

- Objective: Verify the visual styling of the error message when login fails.
- Steps:

1. Navigate to https://saucedemo.com
2. Click the "Login" button without entering credentials.
3. Check the error container at the bottom of the form.

- Expected Result: A red error banner appears displaying: "Epic sadface: Username is required". An "X" icon appears inside the input fields.

## 3. Inventory Page Sorting Dropdown

- Objective: Verify that the product sorting dropdown options are interactive.
- Steps:

1. Log in as standard_user.
2. Click on the product sort dropdown (top right).

- Expected Result: The dropdown expands to display four options: Name (A to Z), Name (Z to A), Price (low to high), Price (high to low). [16]

---

## E2E (End-to-End) Test Case Examples

E2E tests focus on the complete business workflow, ensuring data flows correctly through the system from the start of a user journey to the final confirmation. [17, 18, 19, 20, 21]

## 1. Complete E2E Purchase Flow

- Objective: Verify a user can successfully select an item, checkout, and complete an order.
- Steps:

1. Navigate to https://saucedemo.com and log in as standard_user.
2. Click "Add to cart" on the "Sauce Labs Backpack".
3. Click the Shopping Cart icon in the top right.
4. Click the "Checkout" button on the cart page.
5. Enter First Name, Last Name, and Postal Code, then click "Continue".
6. Review the Checkout Overview page and click "Finish".

- Expected Result: The app displays the confirmation page with the header "Thank you for your order!" and the cart badge count resets to zero.

## 2. Cart Persistence Flow

- Objective: Verify that items added to the cart remain there through navigation and state changes.
- Steps:

1. Log in as standard_user and add two different items to the cart.
2. Click the Shopping Cart icon to verify both items are listed.
3. Click "Continue Shopping" to go back to the inventory page.
4. Click an item name to open its specific product detail page.
5. Click the Shopping Cart icon again from the detail page.

- Expected Result: The cart badge consistently displays "2", and both original items remain in the cart list.

## 3. Locked-Out User Workflow

- Objective: Verify that the system actively blocks banned account workflows at the authentication gate.
- Steps:

1. Navigate to https://saucedemo.com
2. Enter locked_out_user in the username field.
3. Enter secret_sauce in the password field.
4. Click the "Login" button.

- Expected Result: Authentication fails, the system blocks access to the inventory page, and displays: "Epic sadface: Sorry, this user has been locked out."

---
