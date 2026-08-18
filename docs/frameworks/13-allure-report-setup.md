# 13 — Allure Report Setup

Step-by-step guide for wiring Allure reporting into this project, plus a
record of what was actually done. See `docs/frameworks/12-fixtures-and-storage-state.md`
for the doc-numbering convention this file follows.

## How Allure fits into Playwright

Two separate pieces, both needed:

1. **`allure-playwright`** — a Playwright Test reporter. During a test run it
   writes one raw result file per test into `allure-results/` (JSON + attachments).
   It does **not** produce an HTML report by itself.
2. **`allure-commandline`** — the actual Allure CLI (a Java application,
   distributed as an npm package for convenience). It reads `allure-results/`
   and renders the human-readable HTML report into `allure-report/`.

So the flow is: `playwright test` → `allure-results/` (via the reporter) →
`allure generate` → `allure-report/` (static HTML you open in a browser).

Because the CLI is a Java app, **a JRE must be installed** wherever you run
`allure generate`/`allure open`. `ubuntu-latest` GitHub-hosted runners ship
one already; on a local machine, check with `java -version`.

## Step-by-step setup

1. **Confirm Java is available** (required for the CLI, not for the reporter):

   ```bash
   java -version
   ```

   If missing, install any JRE/JDK 8+ (e.g. Temurin).

2. **Install the two packages as devDependencies** (pnpm only, per this project's rules):

   ```bash
   pnpm add -D allure-playwright allure-commandline
   ```

3. **Register the reporter in `playwright.config.js`**, alongside (not instead
   of) the existing HTML reporter:

   ```js
   reporter: [
     ["html"],
     ["allure-playwright", { outputFolder: "allure-results" }],
   ],
   ```

4. **Add `pnpm` scripts** to `package.json` for generating and viewing the report:

   ```json
   "report:allure:generate": "allure generate ./allure-results --clean -o ./allure-report",
   "report:allure:open": "allure open ./allure-report",
   "report:allure": "pnpm run report:allure:generate && pnpm run report:allure:open"
   ```

5. **Ignore the generated directories** — `allure-results/` (raw data) and
   `allure-report/` (rendered HTML) are build output, not source:
   - `.gitignore`: add `/allure-results/` and `/allure-report/`
   - `.prettierignore`: add `allure-results` and `allure-report`
   - `eslint.config.mjs` `ignores`: add `allure-results/**` and `allure-report/**`
     (the generated report bundles minified JS that ESLint will otherwise try
     to lint and fail on)

6. **Wire CI** (`.github/workflows/playwright.yml`) to generate the report
   after tests run and upload it as a build artifact:

   ```yaml
   - name: Generate Allure report
     if: ${{ !cancelled() }}
     run: pnpm run report:allure:generate

   - name: Upload Allure report
     if: ${{ !cancelled() }}
     uses: actions/upload-artifact@v7
     with:
       name: allure-report
       path: allure-report/
       retention-days: 14
   ```

   `if: !cancelled()` (rather than `if: always()`) matches the existing HTML
   report upload step's convention, and still runs on both pass and fail —
   just not if the job was cancelled.

7. **Verify locally**:
   ```bash
   pnpm exec playwright test
   pnpm run report:allure:generate
   pnpm run report:allure:open
   ```

## Usage

- `pnpm exec playwright test` — runs tests, writes both `playwright-report/`
  (HTML reporter) and `allure-results/` (Allure reporter) as before.
- `pnpm run report:allure` — generates `allure-report/` from the latest
  `allure-results/` and opens it in a browser.
- `pnpm run report:allure:generate` — generate only (used in CI, where there's
  no browser to open).

## Notes / trade-offs

- `allure-results/` is overwritten on every `playwright test` run (each test
  writes a fresh result file); `--clean` on `generate` prevents stale entries
  from a previous `allure-report/` build lingering.
- No `history/` trend data is preserved between CI runs yet — that requires
  restoring the previous `allure-report/history/` folder into the next run's
  `allure-results/history/` before generating (e.g. via a cache/artifact
  step). Out of scope for this pass; add if trend graphs become a priority.
- Categories/environment info (`environment.properties`, `categories.json`)
  are not configured — the report uses Allure's defaults.
