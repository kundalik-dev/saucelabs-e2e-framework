# CI Fixes: Node Runner Deprecation & Visual Baseline Mismatch (2026-07-22)

> **Purpose**: Explains two GitHub Actions CI problems hit right after Phase 1 (linting) shipped, in plain language, plus a step-by-step reference for the new "Update Visual Baselines" workflow. Read this before touching `.github/workflows/*.yml` or `visual-baselines/`.

---

## Problem 1: "Node.js 20 is deprecated"

**The simple version:** GitHub Actions runs your CI on a rented computer. The little helper tools we use to set that computer up (`actions/checkout`, `actions/setup-node`, `actions/upload-artifact`) each come in numbered versions, like app updates. We were using old versions (`@v4`) that were built assuming an older engine (Node.js 20) would always be available inside them. GitHub retired that engine, so those old helper tools started complaining every run — like an old phone charger warning you it's about to stop working.

**What actually happened:** `actions/checkout@v4` and `actions/setup-node@v4` were pinned to a major version whose internal runtime targeted Node 20. GitHub deprecated Node 20 as an Actions runtime, so every run printed a deprecation warning (and would eventually just fail once support is fully pulled).

**The fix:** Checked the real, current version of each action (via `https://api.github.com/repos/<owner>/<repo>/releases/latest` — never guess) and bumped all three:

| Action                    | Old   | New   |
| ------------------------- | ----- | ----- |
| `actions/checkout`        | `@v4` | `@v7` |
| `actions/setup-node`      | `@v4` | `@v7` |
| `actions/upload-artifact` | `@v4` | `@v7` |

**Lesson for next time:** when GitHub says an action "targets Node X but is being forced to run on Node Y," it's almost always an out-of-date `@v` pin, not a real bug in your workflow logic. Look up the action's latest release and bump it.

---

## Problem 2: Visual test failing in CI — "snapshot doesn't exist"

**The simple version:** Imagine you take a photo of your bedroom with your own phone, and keep it as "what my room should look like." Now you ask a friend, in a completely different house, with a different camera, to check if their room looks the same as your photo. Except your friend doesn't have a copy of your photo at all — so they can't compare anything, they can only take a brand-new photo and say "I have nothing to check this against!"

That's exactly what happened. Playwright's screenshot tests (`toHaveScreenshot()`) save the "expected" photo with the computer's operating system baked right into the filename:

- Screenshot taken on your Windows laptop → `login-page-chromium-win32.png`
- Screenshot GitHub's CI needs (it runs on Linux) → `login-page-chromium-linux.png`

We only had the `win32` one committed to the repo. CI runs on Linux, looked for `login-page-chromium-linux.png`, found nothing, and failed with _"A snapshot doesn't exist... writing actual."_

**Why not just rename the Windows file to pretend it's the Linux one?** Fonts, anti-aliasing, and pixel rendering are genuinely slightly different between Windows and Linux. A renamed file would still fail — it would compare pixel-by-pixel against a photo taken on the wrong "camera." The only correct fix is to generate a real screenshot _on Linux_, the same way CI will always check it.

**The fix:** Since there's no easy way to run a real Linux machine from a Windows dev laptop, we let GitHub's own Linux CI runner take that first photo, once, on demand — via a brand-new workflow: **`.github/workflows/update-visual-baselines.yml`**.

---

## How the "Update Visual Baselines" workflow works

It's a completely separate workflow from your normal test pipeline (`playwright.yml`), and it is **manual-only** — it has no `push` or `pull_request` trigger, only:

```yaml
on:
  workflow_dispatch:
```

That means it can _never_ run by accident. It only runs when a person clicks a button. This matches the rule: **baselines only change when you say so.**

When you do run it, on GitHub's `ubuntu-latest` runner (the exact OS your real CI uses), it:

1. Checks out the repo and installs everything (`pnpm install`, Playwright browsers).
2. Runs `pnpm exec playwright test --update-snapshots` — this takes a fresh screenshot of the login page and saves it as the new "expected" baseline, instead of comparing against one that doesn't exist yet.
3. Commits that new `.png` file straight into `visual-baselines/` and pushes it back to the branch, using a message like `chore: update visual regression baselines`.
4. If nothing actually changed (no visual difference), it skips the commit — no noise.

After that finishes, the real `login-page-chromium-linux.png` exists in the repo, on the same OS lineage CI checks against, so your normal `Playwright Tests` workflow will pass that test from then on — automatically, with no further action needed.

---

## Step-by-step: how to run it (reference for future you)

1. Make sure `.github/workflows/update-visual-baselines.yml` is already committed and pushed to GitHub (it has to exist on the branch before you can run it).
2. Go to your repository on **GitHub.com**.
3. Click the **Actions** tab (top of the repo page).
4. In the left sidebar, click **"Update Visual Baselines"**.
5. Click the **"Run workflow"** dropdown (top-right of the run list).
6. Pick the branch you want to update baselines on (usually `main`).
7. Click the green **"Run workflow"** button.
8. Wait for the run to go green (~1–3 minutes).
9. Back on your machine, run `git pull` so your local repo also has the new `visual-baselines/**/*.png` file(s).
10. Your regular CI (`Playwright Tests` workflow) will now pass that visual test on every future push, until the page's look changes again.

## When to run it again

- **Only** after an _intentional_ UI change to the login page (new logo, new layout, new color scheme, etc.) where you expect the screenshot to look different.
- **Never** just because a visual test is red — investigate first. A visual diff can be a real bug (something broke the layout); blindly re-running this workflow would "bless" a broken screenshot as the new correct one.

## Important things to remember

- This workflow needs push access (`permissions: contents: write` is already set in the file). If the target branch has protection rules that block direct pushes — even from GitHub Actions bots — this last step will fail, and it would need to be changed to open a pull request instead.
- It only ever touches files under `visual-baselines/`. It cannot modify test code, page objects, or anything else.
- It's completely separate from the normal `playwright.yml` CI — that one still runs automatically on every push/PR and still fails loudly on a real visual mismatch, exactly as it should.

## Related reading

- `docs/frameworks/06-visual-testing.md` — general mechanics of `toHaveScreenshot()`, masking, thresholds.
- `docs/frameworks/09-eslint-prettier-setup.md` — Phase 1 lint/format setup (same CI pipeline, different concern).
- `CLAUDE.md` → **Lessons learned / gotchas** — the condensed, one-line version of both lessons above.
