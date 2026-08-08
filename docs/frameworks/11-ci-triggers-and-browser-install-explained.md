# CI Triggers & Browser Install, Explained (2026-07-22)

> **Purpose**: A from-scratch explanation of how `.github/workflows/playwright.yml`'s triggers actually work (which events, which branches) and why the browser-install step currently downloads more than it needs to. Written for future-you who doesn't remember GitHub Actions trigger semantics off the top of your head. No code was changed to write this doc — see the [What to actually change](#what-to-actually-change-when-youre-ready) section at the bottom for the exact edits, still unapplied.

---

## Part 1: How GitHub Actions decides _when_ to run at all

Every workflow file starts with an `on:` block. Think of it as a list of doorbells — GitHub only walks over and runs your workflow when one of those specific doorbells gets pressed. Nothing else, ever.

Your current `on:` block, from `.github/workflows/playwright.yml`:

```yaml
on:
  push:
    branches: [main, master]
  pull_request:
    branches: [main, master]
```

There are two doorbells here: `push` and `pull_request`. Both are wired up — so yes, this workflow runs for **both** kinds of events. But each doorbell has its own rules for _which branch_ counts, and they're not the same rule. This is the part that trips people up.

### The `push` doorbell

`push` fires whenever commits land on a branch **inside this repo** — whether that's you running `git push` from your laptop, or a PR getting merged (a merge is itself a push, to whatever branch it merged into).

`branches: [main, master]` here means: **only ring this doorbell if the branch that just received commits is `main` or `master`.**

```
git push origin main        →  ✅ triggers (main is in the list)
git push origin master      →  ✅ triggers (master is in the list)
git push origin qabranch    →  ❌ does NOT trigger (qabranch isn't in the list)
git push origin feature/x   →  ❌ does NOT trigger
```

So right now, if you're doing work on `qabranch` and pushing commits to it directly, **you get zero CI feedback**. The tests never run. You wouldn't find out something's broken until later, when you open a PR into `main`.

### The `pull_request` doorbell

This is the one that surprises people. `pull_request`'s `branches:` filter does **not** look at the branch you're working on (the "head" / "source" branch). It looks at the branch the PR is **targeting** — the "base" branch, i.e. the one you'd merge _into_.

```
PR:  qabranch → main         →  ✅ triggers (base is "main", which is in the list)
PR:  feature/login → main    →  ✅ triggers (base is "main")
PR:  feature/login → qabranch →  ❌ does NOT trigger (base is "qabranch", NOT in the list)
```

So a PR _from_ `qabranch` _into_ `main` will run this workflow — because the destination (`main`) matches, regardless of where the PR is coming from. But a PR that targets `qabranch` as its destination won't run anything, because `qabranch` was never added to the list.

### Putting it together for this repo, today

| What you do                                | Does CI run? | Why                                       |
| ------------------------------------------ | ------------ | ----------------------------------------- |
| Push a commit directly to `main`           | ✅ Yes       | `push` + branch is `main`                 |
| Push a commit directly to `qabranch`       | ❌ No        | `qabranch` not in `push.branches`         |
| Open a PR from `feature/x` into `main`     | ✅ Yes       | `pull_request` + base is `main`           |
| Open a PR from `feature/x` into `qabranch` | ❌ No        | `qabranch` not in `pull_request.branches` |
| Open a PR from `qabranch` into `main`      | ✅ Yes       | `pull_request` + base is `main`           |

The practical effect: `qabranch` is currently a CI blind spot. Anything pushed there runs untested until it either gets PR'd into `main` (where it finally gets checked) or someone remembers to run tests locally.

---

## Part 2: What's the right setup for _this_ practice app?

You're using a `feature → qabranch → main` style flow (a lightweight version of what teams call a "promotion" branching model: work lands on a QA/staging branch first, gets validated, _then_ gets promoted to `main`). For that flow to actually be worth practicing, `qabranch` needs the same CI safety net `main` gets — otherwise the "QA" step isn't really checking anything.

**Recommended trigger block** (not yet applied — see bottom of doc):

```yaml
on:
  push:
    branches: [main, master, qabranch]
  pull_request:
    branches: [main, master, qabranch]
```

What this buys you:

- Push straight to `qabranch` → tests run immediately, so you find out fast if something's broken.
- PR from `qabranch` → `main` → tests run again as a gate before the "promotion" to main.
- PR from any `feature/*` branch → `qabranch` → also runs now, since `qabranch` is a valid target.

This is the same shape as real-world setups: an integration/staging branch gets its own CI coverage, not just the production branch. As the repo grows, a common next step is to _stop_ naming every branch explicitly under `pull_request` (just drop `branches:` entirely there, so **every** PR to **anything** gets checked) while keeping `push` restricted to just the "important" branches (`main`, `qabranch`) to avoid burning CI minutes on every tiny WIP push to a throwaway feature branch. For now, with a small number of named branches, being explicit like above is easier to reason about while you're still building the muscle memory for how these triggers behave.

---

## Part 3: Why "only Chromium" isn't fully true yet

There are actually **two separate on/off switches** for browsers in a Playwright project, and only one of them is set to "Chromium only" right now. This is the part that's easy to miss.

### Switch 1 — which browsers Playwright _installs_ (binaries)

This happens in CI via:

```yaml
- name: Install Playwright Browsers
  run: pnpm exec playwright install --with-deps
```

`playwright install` downloads actual browser binaries (Chromium, Firefox, WebKit) plus their OS-level dependencies, onto the CI runner's disk. **With no browser name given, it downloads all three**, every single run — regardless of whether you'll ever use Firefox or WebKit. This is pure download-and-disk-space cost; it doesn't run any tests by itself.

### Switch 2 — which browsers Playwright actually _runs tests in_

This is controlled by `projects` in `playwright.config.js`:

```js
projects: [
  {
    name: "chromium",
    use: { ...devices["Desktop Chrome"] },
  },

  // {
  //   name: 'firefox',
  //   use: { ...devices['Desktop Firefox'] },
  // },

  // {
  //   name: 'webkit',
  //   use: { ...devices['Desktop Safari'] },
  // },
],
```

Only the `chromium` project is active (Firefox/WebKit are commented out). So when `pnpm run test` executes, **it only ever runs tests in Chromium** — this part is already exactly what you want.

### So what's the actual problem?

Switch 2 (which browsers _run_) is already Chromium-only. Switch 1 (which browsers get _installed_) is not — CI installs all three browser binaries every run, then only ever uses one of them. It's like packing suitcases for Paris, London, and Tokyo, and only ever going to Paris. The download step is pure waste: slower CI runs, more bandwidth, more disk churn, for browsers that never get used.

### How to fix it (not yet applied)

The simplest fix — tell `playwright install` exactly which browser to fetch:

```yaml
run: pnpm exec playwright install --with-deps chromium
```

A slightly more flexible version, if you want a single place to change this later without hunting through the YAML (e.g. the day you uncomment the `firefox` project too):

```yaml
env:
  PW_BROWSERS: chromium
# ...later, in the same job...
run: pnpm exec playwright install --with-deps ${{ env.PW_BROWSERS }}
```

Then adding Firefox back later is a one-line change: `PW_BROWSERS: chromium firefox` — both the install step _and_ (separately) `playwright.config.js`'s `projects` array would need Firefox uncommented for it to actually be tested, but at least the install step would no longer be the thing silently downloading browsers nobody asked for.

---

## What to actually change, when you're ready

Nothing in this doc has been applied yet — these are the exact edits waiting for a go-ahead:

1. **`.github/workflows/playwright.yml`** — add `qabranch` to both `push.branches` and `pull_request.branches`.
2. **`.github/workflows/playwright.yml`** — change `pnpm exec playwright install --with-deps` to `pnpm exec playwright install --with-deps chromium` (in both the `lint` job, if it installs browsers, and the `test` job).
3. **`.github/workflows/update-visual-baselines.yml`** — same browser-install change, so the manual baseline-update workflow doesn't waste time either.

None of these touch test code, page objects, or `playwright.config.js` — they're all CI-workflow-only edits.

## Related reading

- `docs/frameworks/10-ci-fixes-node-runner-and-visual-baselines.md` — the two CI fixes that came right before this (action version pins, visual baseline mismatch).
- `CLAUDE.md` → **CI/CD Pipeline** section — current source of truth for what CI actually does today.
- [GitHub Actions docs: events that trigger workflows](https://docs.github.com/actions/using-workflows/events-that-trigger-workflows) — official reference for `push`/`pull_request` filtering behavior.
