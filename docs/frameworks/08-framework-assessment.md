# Framework Assessment (2026-07-22)

> **Purpose**: A point-in-time rating of this repo against industry-grade Playwright/POM framework expectations — architecture, scripting quality, and scalability — plus a phased improvement roadmap. Re-run this assessment periodically as the framework grows; don't treat the scores as permanent.

---

## Overall rating: 6 / 10

Strong foundation and unusually mature documentation for its size, but actual test coverage and scaffolding are still early-stage — most of the "framework" is currently 2 working spec files plus a well-written blueprint for the rest (see `01-frameworks.md`, `03-test-data-strategy.md`).

## Scorecard by dimension

| Dimension                    | Score | Why                                                                                                                                                                                                                                                                                                                            |
| ---------------------------- | ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| POM design & conventions     | 8/10  | Clean separation (locators grouped by region, `Loc` suffix, action methods), consistent naming, tests never touch `page.locator()` directly. Missing a `BasePage`/shared component layer once more pages land.                                                                                                                 |
| Scripting / code quality     | 5/10  | The 2 implemented specs (`auth.ui`, `auth.e2e`) are clean and follow Arrange/Act/Assert. But: no linter/formatter (no ESLint/Prettier config anywhere), no CI type/lint gate, `inventory.page.js` has a dead/broken `productSearch` stub sitting in shipped code, no test isolation strategy for data beyond static JSON.      |
| Test data strategy           | 7/10  | Good instinct separating JSON constants from JS logic-bearing data (`auth-data.js`), and a target spec for `testCases`-nested data was written before it was needed (`03-test-data-strategy.md`). Not yet using data factories, so any dynamic/parallel-unsafe data (checkout forms, unique emails) will need that layer soon. |
| Scalability (as suite grows) | 4/10  | No fixtures — every spec manually `new`s page objects in `beforeEach`; fine at 2 files, painful at 20. No `storageState`/`globalSetup`, so every single test pays a full UI login. No multi-environment config (`baseURL` hardcoded in `playwright.config.js`). No `BasePage` for shared waits/toasts.                         |
| CI/CD & reporting            | 5/10  | GitHub Actions exists and runs the real suite on push/PR — genuinely good for this stage. But: single job, no smoke/regression split despite the tag convention being documented, no JUnit/Allure output for dashboards, no sharding, no failure notifications.                                                                |
| Coverage breadth             | 3/10  | Only login is covered end-to-end. Cart, checkout, payment page objects are empty files; `tests/api` is empty; no accessibility tests. The core commerce flow (add to cart → checkout → confirm) — the thing an E2E framework exists to prove — isn't automated yet.                                                            |
| Documentation & process      | 9/10  | The standout. `CLAUDE.md`/`AGENTS.md`/`README.md` are accurate and kept in sync, and the `docs/frameworks/` set (target architecture, test-data strategy, visual testing, learnings) is genuinely industry-grade planning — most real projects never write this down at all.                                                   |

## What's missing vs. a typical industry-grade Playwright framework

- **No lint/format gate** — no ESLint/Prettier config or `pnpm lint` script; nothing stops style drift or catches dead code (e.g. the incomplete `productSearch` stub in `inventory.page.js`).
- **No fixtures / no `storageState`** — biggest scalability gap; already flagged in `CLAUDE.md` as planned, and it's the thing that most affects suite runtime and spec boilerplate as tests are added.
- **No environment matrix** — `baseURL` is hardcoded in `playwright.config.js`; no `.env`/`.env.example` pattern for dev/staging/prod.
- **`package.json` hygiene** — empty `description`/`author`, no `engines` field pinning the Node version, `test` script uses `npx` instead of the pnpm-managed binary (minor inconsistency with the "pnpm only" convention).
- **No API or accessibility layer** — both are stubbed as empty folders/roadmap items only.
- **CI is single-tier** — no fast "smoke on every PR" vs. "full regression nightly" split, even though the `@smoke`/`@regression` tagging convention is already documented.
- **No pre-commit hook (Husky + lint-staged)** — nothing enforces conventions locally before they hit CI.

## Suggested future approach (phased, no scope creep)

### Phase 1 — Harden what exists (before adding more tests)

1. Add ESLint + Prettier, wire a `pnpm lint` script into CI.
2. Fix/remove the `productSearch` dead code in `inventory.page.js`.
3. Add `engines` to `package.json`, fix the `test` script to use the local Playwright bin via pnpm.

### Phase 2 — Unlock scalability

4. Implement `global-setup.js` + `storageState` — biggest ROI, cuts login overhead from every non-login test.
5. Introduce a thin `base.fixture.js` extending Playwright's `test` to auto-inject page objects — removes manual `new` in every `beforeEach`.
6. Add `BasePage` once a 3rd/4th page object is written and shared waits start duplicating.

### Phase 3 — Fill core coverage

7. Implement `cart.page.js` → `checkout.page.js` → `payment.page.js` and their e2e specs — the actual "E2E" promise of the framework (add to cart → checkout → confirmation).
8. Start `tests/api` for anything that can be verified without the UI.

### Phase 4 — CI/CD maturity

9. Split CI into a fast `@smoke` job per PR and a full regression job on a schedule/main-branch push.
10. Add JUnit/Allure output alongside HTML for trend dashboards; upload traces/videos on failure only.
11. Add Husky + lint-staged for local pre-commit enforcement.

### Phase 5 — Polish

12. Multi-environment config (`.env` + per-env `baseURL`/creds) once there's more than one target environment.
13. Accessibility (`@axe-core/playwright`) pass once functional coverage is solid.

If Phase 1–2 land first, expect this to move from 6 → 8/10 — the documentation and conventions are already there; it's the runtime scaffolding (fixtures, storageState, lint) and core commerce coverage holding the score back.
