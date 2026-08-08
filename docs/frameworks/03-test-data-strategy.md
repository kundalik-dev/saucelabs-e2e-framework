# Test Data Strategy: Folder Structure, Shape, and Binding

> **Purpose**: This is a **reference/target document**, in the same spirit as `01-frameworks.md`. It describes how JSON test data should be organized as the suite grows, and shows the current data files as a baseline to compare against. It is not yet applied to the repo — treat it as the plan to adopt incrementally, not a description of current state.

---

## 1. The problem

Today, `<pageName>-data.json` is a single flat object shared by every spec in that page's test files (merged via `{ ...loginPageData, ...productPageData }` per `CLAUDE.md`). That's fine for genuinely page-wide constants (URLs, headings, footer text), but flat sharing breaks down once **multiple tests need their own input data under similar keys** — editing a key for one test silently changes or removes it for another test that happens to read the same key.

Rule of thumb:

| Data kind                                                                | Example                                                         | Where it lives                                                  |
| ------------------------------------------------------------------------ | --------------------------------------------------------------- | --------------------------------------------------------------- |
| Shared page constant — same for every test on that page                  | `productsPageHeading`, `footerCopyRightText`, `productsPageUrl` | top level of `<pageName>-data.json`                             |
| Per-test input — only one (or a couple of) test(s) care about this value | the product name a specific "add to cart" test uses             | nested under a `testCases` object, keyed by a short scenario id |

---

## 2. Folder structure

```
test-data/
└── static/
    ├── static-data.js                  # aggregates + re-exports all page JSON (existing convention)
    ├── login-data/
    │   └── loginPage-data.json
    └── products-data/
        ├── productsPage-data.json      # page-level shared data + testCases
        ├── productsTestCases.js        # scenario-id constants for productsPage-data.json's testCases
        ├── productsList-data.json      # array data for per-row, data-driven assertions
        └── productsNamesList.json
```

- One JSON file per page (`<pageName>-data.json`), as today.
- One optional `<pageName>TestCases.js` sibling file per page **only if** that page's JSON has a `testCases` block — it exports short, stable id constants so specs never hand-type the raw key string.
- `<pageName>List-data.json` stays as-is for array/data-driven fixtures — that convention doesn't have the sharing problem since each row is already scoped to one iteration.

---

## 3. Current data files (baseline)

**`test-data/static/login-data/loginPage-data.json`**

```json
{
  "appUrl": "/",
  "username": "standard_user",
  "password": "secret_sauce",

  "invaliUsername": "testing",
  "invalidPassword": "testing",
  "errorMsgText": "Epic sadface: Username and password do not match any user in this service"
}
```

**`test-data/static/products-data/productsPage-data.json`**

```json
{
  "appLogoText": "Swag Labs",
  "productsPageHeading": "Products",
  "footerCopyRightText": "© 2026 Sauce Labs. All Rights Reserved. Terms of Service | Privacy Policy",
  "productsPageUrl": "/inventory.html",
  "socialIconNames": ["Twitter", "Facebook", "LinkedIn"],
  "sortOrders": ["lohi", "hilo"],
  "addToCart": {
    "productName": "Sauce Labs Bolt T-Shirt",
    "productCount": "1"
  },
  "buttonLabels": {
    "addToCart": "Add to cart",
    "remove": "Remove"
  }
}
```

Everything here is currently flat/page-level. `addToCart` is really per-test input (only the add-to-cart/remove tests use it) sitting at the top level as if it were a page constant — that's the exact shape the `testCases` nesting below is meant to replace.

---

## 4. Target arrangement

Keep genuine page constants at the top level; move per-test input under `testCases`, keyed by a short camelCase scenario id (not the full `verify_...` test title — too long, and title changes shouldn't force a data-key rename):

```json
{
  "appLogoText": "Swag Labs",
  "productsPageHeading": "Products",
  "footerCopyRightText": "© 2026 Sauce Labs. All Rights Reserved. Terms of Service | Privacy Policy",
  "productsPageUrl": "/inventory.html",
  "socialIconNames": ["Twitter", "Facebook", "LinkedIn"],
  "sortOrders": ["lohi", "hilo"],
  "buttonLabels": {
    "addToCart": "Add to cart",
    "remove": "Remove"
  },
  "testCases": {
    "addToCartRemove": {
      "productName": "Sauce Labs Bolt T-Shirt"
    },
    "addToCartRemoveViaLocator": {
      "productName": "Sauce Labs Bolt T-Shirt",
      "productCount": "1"
    }
  }
}
```

`buttonLabels` stays top-level: the same "Add to cart" / "Remove" strings are true for every product/test, so it's a page constant, not per-test input.

### 4.1 Scenario-id constants

`productsTestCases.js` — one export per `testCases` key, so specs reference an identifier instead of retyping the raw string:

```js
export const ProductsTestCase = Object.freeze({
  ADD_TO_CART_REMOVE: "addToCartRemove",
  ADD_TO_CART_REMOVE_VIA_LOCATOR: "addToCartRemoveViaLocator",
});
```

### 4.2 Binding in a spec

```js
import { ProductsTestCase } from "../../../test-data/static/products-data/productsTestCases";

const data = { ...loginPageData, ...productPageData };

test("verify_single_product_add_to_cart_and_remove_lifecycle", async ({
  page,
}) => {
  const tc = data.testCases[ProductsTestCase.ADD_TO_CART_REMOVE];

  await productsPage.searchProductAddToCart(tc.productName);
  // ...
});
```

Each test destructures only its own `testCases` entry (`tc`), so editing or renaming another test's entry can't affect it — a mismatch surfaces as `tc` being `undefined` immediately, not a silently wrong value.

---

## 5. When to add a `testCases` block

Only once a page's JSON already has, or is about to get, a key that's read by exactly one (or a small subset of) test(s). Pages/files where every key is a true shared constant (like `loginPage-data.json` above) don't need one — don't add the nesting speculatively.
