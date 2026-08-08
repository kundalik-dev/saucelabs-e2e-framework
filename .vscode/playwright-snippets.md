# Playwright Snippets Reference

Defined in [playwright.code-snippets](playwright.code-snippets). Type the prefix in a `.js`/`.ts` file and press Tab/Enter to expand.

| Prefix             | Gives                                              |
| ------------------ | -------------------------------------------------- |
| `pw-import`        | `import { test, expect } from "@playwright/test";` |
| `pw-test-describe` | `test.describe(...)` block                         |
| `pw-test`          | `test(...)` block with Arrange/Act/Assert comments |
| `pw-test-only`     | `test.only(...)` block                             |
| `pw-test-skip`     | `test.skip(...)` block                             |
| `pw-before-each`   | `test.beforeEach(...)` hook with `page.goto`       |
| `pw-after-each`    | `test.afterEach(...)` hook                         |
| `pw-locator`       | `await page.locator("...").action();`              |
| `pw-gb-role`       | `await page.getByRole("...", { name: "..." }).action();`    |
| `pw-gb-label`      | `await page.getByLabel("...", { exact: true }).action();`   |
| `pw-gb-placeholder`| `await page.getByPlaceholder("...", { exact: true }).action();` |
| `pw-gb-testid`     | `await page.getByTestId("...").action();`                   |
| `pw-gb-text`       | `await page.getByText("...", { exact: true }).action();`    |
| `pw-gb-title`      | `await page.getByTitle("...", { exact: true }).action();`   |
| `pw-gb-alttext`    | `await page.getByAltText("...", { exact: true }).action();` |
| `pw-wf-time`       | `await page.waitForTimeout(1500);`                 |
| `pw-expect`        | `await expect(page....).matcher();`                |
| `pw-spec`          | Full spec file skeleton: import + describe + test  |
