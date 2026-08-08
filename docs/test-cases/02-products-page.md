# Prodcuts page test cases

Here is the list of test case names extracted from the list above:

- `verify_product_page_elements_load_successfully`
- `verify_total_product_count_matches_expected_data`
- `verify_individual_product_details_against_data_source`
- `verify_product_sorting_by_name_direction_[SortDirection]`
- `verify_product_sorting_by_price_[SortDirection]`
- `verify_single_product_add_to_cart_and_remove_lifecycle`
- `verify_multiple_products_addition_updates_cart_badge_correctly`
- `verify_navigation_to_product_detail_page_via_[ClickTarget]`
- `verify_sidebar_menu_options_expand_and_collapse`
- `verify_reset_app_state_clears_active_cart_selections`

## 1. Product Display & Elements Verification

- **Test Case Name:** `verify_product_page_elements_load_successfully`
- **Objective:** Ensure that all critical structural components of the products page render correctly upon a successful login.
- **Steps:**

1. Log in with a valid user.
2. Verify the visibility of the primary header area (`Swag Labs`).
3. Assert that the product sort dropdown and the shopping cart container are present.
4. Assert that the footer text and social media icons (Twitter, Facebook, LinkedIn) are displayed.

## 2. Product Grid Count Validation

- **Test Case Name:** `verify_total_product_count_matches_expected_data`
- **Data Variation:** JSON/Excel array containing expected product counts or lists.
- **Objective:** Validate that the inventory grid populates the exact number of items expected.
- **Steps:**

1. Fetch the expected product count from your data file (e.g., `expectedCount: 6`).
2. Count the total number of inventory item containers on the page.
3. Assert that the UI count matches the data-driven expected count.

## 3. Data-Driven Product Details Verification

- **Test Case Name:** `verify_individual_product_details_against_data_source`
- **Data Variation:** JSON/Excel dataset containing arrays of object properties: `[{"name": "Sauce Labs Backpack", "price": "$29.99", "desc": "..."}, ...]`
- **Objective:** Cross-verify that the text, description, and price displayed on the UI for each item match your source data perfectly.
- **Steps:**

1. Iterate through the inventory items.
2. Extract the title text, description text, and price for a given product.
3. Assert that the extracted UI text matches the corresponding object in your JSON/Excel file.

## 4. Sorting Functionality: Name (A to Z) & (Z to A)

- **Test Case Name:** `verify_product_sorting_by_name_direction_[SortDirection]`
- **Data Variation:** Map a parameter `sortOption` to `az` or `za`.
- **Objective:** Validate that selecting an alphabetical sort correctly re-orders the item DOM elements.
- **Steps:**

1. Select the name sorting option from the dropdown (e.g., "Name (Z to A)").
2. Collect all product titles into a JavaScript array.
3. Verify that the array matches a programmatically sorted copy in descending alphabetical order.

## 5. Sorting Functionality: Price (Low to High) & (High to Low)

- **Test Case Name:** `verify_product_sorting_by_price_[SortDirection]`
- **Data Variation:** Map a parameter `sortOption` to `lohi` or `hilo`.
- **Objective:** Validate that the numerical sorting correctly arranges products based on price points.
- **Steps:**

1. Select the price sorting option from the dropdown (e.g., "Price (low to high)").
2. Extract all price strings, strip the `$` symbol, and convert them to floats.
3. Assert that the numeric array is strictly sorted in ascending order.

## 6. Single Item Add-To-Cart Functional Lifecycle

- **Test Case Name:** `verify_single_product_add_to_cart_and_remove_lifecycle`
- **Data Variation:** Target a specific product parameter like `productName: "Sauce Labs Bolt T-Shirt"`.
- **Objective:** Ensure the item button toggles state and updates the badge correctly when handling a single item.
- **Steps:**

1. Locate the item container matching the parameterized name.
2. Click the "Add to cart" button.
3. Assert that the shopping cart badge increments to `1`.
4. Assert that the button text changes from "Add to cart" to "Remove".
5. Click "Remove" and verify the badge disappears or decrements.

## 7. Data-Driven Multi-Item Basket Accumulation

- **Test Case Name:** `verify_multiple_products_addition_updates_cart_badge_correctly`
- **Data Variation:** Pass an array of varying lengths from your data sheet: `["Sauce Labs Backpack", "Sauce Labs Onesie", "Sauce Labs Fleece Jacket"]`.
- **Objective:** Validate that the shopping cart badge accurately aggregates multiple separate selections.
- **Steps:**

1. Loop through your data array and click "Add to cart" for each specified item.
2. Extract the text value from the cart badge.
3. Assert that the badge text equals the length of your selected items array.

## 8. Item Detail Page Navigation via Image & Title Links

- **Test Case Name:** `verify_navigation_to_product_detail_page_via_[ClickTarget]`
- **Data Variation:** Parameterize the element to click: `targetElement: "image"` vs `targetElement: "title"`.
- **Objective:** Ensure clicking either an item's title text or its thumbnail image redirects to the correct item sub-page.
- **Steps:**

1. Click the designated target element for a chosen product (e.g., "Sauce Labs Bike Light").
2. Verify the active browser URL changes to include the item specific details (e.g., contains `id=`).
3. Verify that a "Back to products" button is visible on the new page.

## 9. Sidebar Navigation Menu Responsiveness

- **Test Case Name:** `verify_sidebar_menu_options_expand_and_collapse`
- **Objective:** Ensure the slide-out navigation overlay functions smoothly without breaking the layout.
- **Steps:**

1. Click the open menu hamburger button (`Open Menu`).
2. Assert that menu links ("All Items", "About", "Logout", "Reset App State") become visible and interactable.
3. Click the close button (`Close Menu`) or verify state management.

## 10. Persistent App State via "Reset App State" Function

- **Test Case Name:** `verify_reset_app_state_clears_active_cart_selections`
- **Objective:** Confirm that triggering the app state reset wipes user cart selections immediately.
- **Steps:**

1. Add 2 items to the cart and verify the badge reads `2`.
2. Open the sidebar navigation menu.
3. Click the "Reset App State" option link.
4. Assert that the shopping cart badge is no longer present.
5. Assert that the selected product buttons have flipped back to "Add to cart".
