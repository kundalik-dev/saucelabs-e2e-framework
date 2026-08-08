# Visual testing in playwright

This method enables visual regression testing in Playwright. It captures a screenshot of the current page and compares it against a reference baseline image.

### Key Functions

- Visual Comparison: It automatically matches the live page layout against login-page-layout.png.
- Baseline Creation: If the baseline image does not exist, the test fails and creates a new golden image.
- Pixel Matching: It compares the images pixel-by-pixel to catch unintended UI, font, or spacing changes.

## Visual baseline capture

```js
await expect(page).toHaveScreenshot("login-page-layout.png", {
  maxDiffPixels: 100, // Permits up to 100 different pixels
  maxDiffPixelRatio: 0.2, // Permits up to 20% of the image to differ
  threshold: 0.2, // Adjusts color perception sensitivity (0 to 1)
  mask: [page.locator(".dynamic-widget")], // Hides changing data to avoid false failures
});
```

```js
  // Directs all snapshots to a global directory at the project root
  snapshotDir: './visual-baselines',
```

- `npx playwright test --update-snapshots` overwrites old baselines when layout changes are intentional.
