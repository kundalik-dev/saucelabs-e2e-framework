# Test cases naming

test cases name should always follow the below pattern:

- `should <expected behavior> with <data>`
- `should <expected behavior> when <action>`
- `should <expected behavior> when <action> with <data>`
- `should <expected behavior>`

```js
// example of test case name
// pattern 01: `should <expected behavior> with <data>`
should login with valid credentials
should not login with invalid credentials
should fill checkout form with valid data

// pattern 02: `should <expected behavior> when <action>`
should display error message when submitting empty form
should complete checkout when filling all required fields
should sort products by price when clicking on sort dropdown
should add to cart when clicking on add to cart button

// pattern 03: `should <expected behavior> when <action> with <data>`
should display error message when submitting form with invalid data
should add product to cart when clicking on add to cart button
should remove product from cart when clicking on remove button
should complete checkout when filling all required fields with valid data

// pattern 04: `should <expected behavior>`
should display products list
should sort products by price
should logout successfully

```
