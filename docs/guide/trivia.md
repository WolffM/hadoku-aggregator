# OSS Issue Aggregator: trivia

Each fact names the commit it comes from.

## Trivia

- **One engine, one commit.** Repo health scoring, the Contribution
  Viability Score, lifecycle classification and sentiment analysis — the
  whole scoring engine the app is named for — shipped together in a single
  commit (`e0ba48f`).
- **An hour apart.** The recon pipeline's KV reader and claim tracking landed
  at 15:06 on 2026-02-20; the scoring engine built on top of them landed at
  16:11 the same afternoon (`5925bb9`, `e0ba48f`).
- **The biggest commit changed nothing.** Normalizing every source file's
  line endings to LF touched 32,410 lines across 84 files — the largest
  commit in the repo's history, and the only thing it changed was whitespace
  (`104ed30`).
- **Crimson Kitty.** Five endpoints for the pipeline's third version —
  reading a repo's `CONTRIBUTING.md`, PR template, issue templates,
  `CODEOWNERS` and labels — shipped under the internal codename
  "crimson-kitty" (`199b867`).
- **A list that forgot things.** The write-access gate used to be a
  hand-typed allowlist of tiers; it was rewritten to check a tier's rank on
  the platform's own ladder instead, so a tier added above friend later
  needs no one to remember to add it here (`7727156`).
- **Two first commits.** The repo's very first commit is titled "first
  commit"; its second, the same day, is titled "2nd commit" (`3276f76`,
  `7228979`).
- **The shortest commit message** is "test", from that same first day
  (`37a68fd`).
- **CI ran no tests at all, for most of this repo's history.** Only
  typecheck and lint ran on a pull request; the 423 tests under `api/`
  never executed in CI, which is how one of them kept passing locally while
  depending on fixture files excluded by `.gitignore` — it could only ever
  pass on the machine that happened to have them. One commit turned
  typechecking and testing of `api/` on together, fixing the 303 type errors
  that had built up unseen and committing the missing fixtures (`e603aa5`).
