// @ts-check
import { defineConfig, devices } from "@playwright/test";

/**
 * Read environment variables from file without using dotenv package, since Playwright already has built-in support for loading .env files.
 */
try {
  process.loadEnvFile(".env");
} catch {
  // .env is optional (e.g. CI sets RETRIES/WORKERS/CI directly) — ignore if missing.
}

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: "./tests",
  /* Run tests in files in parallel */
  fullyParallel: process.env.PARALLEL === "true",
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry count: RETRIES from .env overrides the CI-only default. */
  retries:
    process.env.RETRIES !== undefined
      ? Number(process.env.RETRIES)
      : process.env.CI
        ? 2
        : 0,
  /* Worker count: WORKERS from .env overrides the CI-only default. */
  workers:
    process.env.WORKERS !== undefined
      ? Number(process.env.WORKERS)
      : process.env.CI
        ? 4
        : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ["html"],
    ["allure-playwright", { outputFolder: "allure-results" }],
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('')`. BASE_URL from .env overrides the default. */
    baseURL:
      process.env.BASE_URL !== undefined
        ? process.env.BASE_URL
        : "https://www.saucedemo.com/",

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "on-first-retry",
    headless:
      process.env.HEADLESS !== undefined
        ? process.env.HEADLESS === "true"
        : true,
    testIdAttribute: "data-test",
    video: "on-first-retry",
    screenshot: "only-on-failure",
  },

  /* Configure projects for major browsers */
  projects: [
    {
      /* Generates auth/storageState.json by logging in once via the UI.
       * Runs before "chromium" (see its `dependencies` below) so specs that
       * opt into storageState via `test.use({ storageState: ... })` always
       * have a fresh session file, instead of relying on someone running
       * tests/auth/auth.setup.js manually first. */
      name: "setup",
      testMatch: /.*\.setup\.js/,
      use: { ...devices["Desktop Chrome"] },
    },

    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
      dependencies: ["setup"],
    },

    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },

    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});
