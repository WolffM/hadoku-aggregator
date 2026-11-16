# OSS Issue Aggregator: contributing

How to run, change and ship the aggregator. What it does for a reader of the
board is in [features.md](features.md). The repo's own
[`AGENTS.md`](../../AGENTS.md) covers colors, secrets, the vault and auth in
more depth; read that too.

## Run it locally

```sh
pnpm install
pnpm dev              # Vite dev server, loads index.html
pnpm build             # build:ui + build:api
pnpm test              # vitest, api/ tests only
pnpm lint:fix           # ESLint + Prettier; also runs in the pre-commit hook
```

A worktree's pre-commit hook installs its own `node_modules` the first time
it runs if none exists yet — `core.hooksPath` points at the tracked `.husky/`
directory itself, so a plain `git worktree add` keeps the hook live, unlike
repos where husky's generated hook directory is gitignored.

E2E (`npx playwright test`) runs against the real production site,
`https://hadoku.me/aggregator` — there is no local e2e stack to start first.

## Architecture

```
scraper (private, cron) ──► Cloudflare KV ◄── this repo reads + scores ──► API ──► vibedispatch
                               recon:{slug}            reads scraper data,        reads scored
                               (scraper-written)        writes its own KV          data over HTTP
                                                         keys, serves both
```

- `src/` — the React UI (`src/entry.tsx` exports `mount(el)` / `unmount(el)`),
  built by Vite into `dist/index.js`.
- `api/` — the Hono API handler (`api/index.ts` exports `createOSSHandler()`),
  built by tsup into `dist/api/index.js`. `api/recon/` (18 modules) is the
  engine itself: `issue-scorer.ts` and `health-scorer.ts` compute the scores,
  `dossier-compiler.ts` assembles the six-section guide, `kv-reader.ts` /
  `kv-writer.ts` read and write Cloudflare KV, `claims.ts` tracks who has
  claimed what, and `crimson-kitty-routes.ts` serves the v3 endpoints
  (`CONTRIBUTING.md`, templates, `CODEOWNERS`, labels).
- **Everything flows through KV, never a database.** The scraper writes
  `recon:{slug}`; this repo reads it, computes `recon:{slug}:health`,
  `:scored-issues` and `:dossier`, and writes those back to the same
  namespace so a second read (or another consumer) does not recompute them.
- **Reads are public; writes need friend tier and up**, checked once for
  every mutating HTTP method in `api/handler.ts` via `requireMinTier('friend')`
  — not per route, so a new mutating endpoint is gated automatically rather
  than by remembering to add a check.
- **A claim goes stale after 14 days** of no further activity
  (`api/recon/precompute.ts`), so an abandoned claim does not block anyone
  else from picking up the issue.
- **This repo has no filesystem and no database at runtime** — everything is
  Cloudflare KV, read and written through the two accessor modules above.

## Tests and gates

```sh
pnpm typecheck   # tsc on both the UI and the api/ tree
pnpm lint        # eslint + lint:icons
pnpm lint:css    # stylelint + the @wolffm/themes usage check
pnpm test        # vitest over api/, including api/tier-gating.test.ts
```

- **The pre-commit hook** runs typecheck, ESLint with `--fix`, Prettier, and
  stylelint, re-staging whatever it auto-fixed.
- **CI** (`ci.yml`) runs typecheck and lint on pull requests and pushes to
  `main`. For most of this repo's life CI ran neither test nor typechecked
  `api/` at all; a single commit turned both on, fixing the 303 type errors
  that had built up unseen in `api/` and adding the step that finally runs
  the suite in CI (`e603aa5`) — see [trivia.md](trivia.md) for what that step
  found.
- **`api/tier-gating.test.ts`** is a smoke test for the write gate: it loops
  over every tier the platform defines and asserts the gate blocks exactly
  the ones ranked below `friend` — so a tier added to the platform's ladder
  later is covered without anyone editing this test.

## How it deploys

A push to `main` that changes the package runs `publish.yml`: the version is
set at publish time, one patch above the registry's newest (never a
committed number — a committed version _above_ the registry's is the one way
to force a deliberate bump), the package is built and published as
`@wolffm/hadoku-aggregator`, and the platform's site repo is notified
(`packages_updated`) so it can pick up the new version. This repo has no
deploy step of its own: putting the published package live, as the Worker
behind `hadoku.me/aggregator`, is the platform's site repo's job.

## Trivia

The package was `@wolffm/oss-aggregator` for its first four months and has
been `@wolffm/hadoku-aggregator` since (`d3942cc`); the repo itself was never
renamed.
