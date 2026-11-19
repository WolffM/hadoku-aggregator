# OSS Issue Aggregator: features

What the aggregator does and how to use it. How it is built is in
[contributing.md](contributing.md).

Reading the board needs no sign-in. "Friend" below is a hadoku.me tier:
anything that writes — claiming an issue, or the API calls behind it — needs
that tier and up (`api/handler.ts`).

## Browsing scored issues

**What it does.** The main board lists every open issue across your watched
repos, each with a Contribution Viability Score, a lifecycle tag (fresh,
triaged, accepted, stale or zombie) and a sentiment indicator read from its
comments.

**How to use it.** Open [hadoku.me/aggregator](https://hadoku.me/aggregator).
Switch between a table and a card grid with the two buttons at the toolbar's
left, search by title, and sort or filter from the controls on the right.
Click an issue to open its detail drawer.

**What it does not do.** The board only shows repos the scraper has already
collected and you have selected (see
[Picking which repos to watch](#picking-which-repos-to-watch)); it never
fetches a new repo on demand from the browser.

## Repo health

**What it does.** For each watched repo: maintainer activity, how accessible
a merge realistically is, contributor availability, and a "kill signal" flag
for a repo that looks abandoned. The viability score is colored green at 70
and above, amber from 40, and red below that.

Health also folds in **quirk detection**. A repo's `CONTRIBUTING.md` and
merged-PR history are scanned for a changeset requirement, a CLA, a
conventional-commits rule, or an off-default target branch. Each quirk is
flagged with its evidence and whether it blocks a contribution outright or
is just something to know (`api/recon/quirks.ts`).

**How to use it.** Open an issue's repo panel from the board, or the health
summary beside a project in the selector; a detected quirk shows there and
in the issue's dossier (see [Contribution dossiers](#contribution-dossiers)).

**What it does not do.** Health is computed from what the scraper has
collected as of its last pass — it is not a live check of the repo at the
moment you look.

## Contribution dossiers

**What it does.** A compiled, six-section guide to contributing to one repo:
overview, contribution rules, success patterns, anti-patterns, the issue
board, and environment setup — assembled from the repo's own
`CONTRIBUTING.md`, PR and issue templates, `CODEOWNERS`, and its labels.

**How to use it.** From an issue's detail drawer, open **View Dossier**. Tabs
across the top switch sections.

**What it does not do.** A dossier is a read-only compiled summary — it is
not a place to draft or submit a contribution; that happens on the forge
itself (or through [hadoku-tenhands](https://github.com/WolffM/hadoku-tenhands)'s
own fork/PR flow).

## Claiming an issue

_Friend tier and up_ (`api/handler.ts`, every mutating request).

**What it does.** Reports that an issue is being worked, so it shows as
claimed (with whoever claimed it) instead of open, which keeps two people —
or two agents — from duplicating the same issue. A claim with no progress for
14 days is shown as stale rather than claimed, so it does not block anyone
else believing it is still being worked.

**How to use it.** Open an issue's detail drawer and press **Claim Issue**.
hadoku-tenhands calls the same claim endpoint itself once it forks a repo
to work an issue, so a claim you see may have come from there rather than
the page.

**What it does not do.** A claim is a courtesy flag, not a lock: nothing in
the API stops a second claim, and nothing here forks the repo or opens a
pull request — that is hadoku-tenhands's job, not this one's.

## Picking which repos to watch

**What it does.** Your own list of which scraped repos appear on your board,
searchable by name; the full list is discovered from what the scraper has
collected, never a list hardcoded into this app.

**How to use it.** Use the project selector's search box and checkboxes to
choose repos; your selection is remembered across visits.

**What it does not do.** It cannot add a repo the scraper has not already
collected — there is no "watch a new repo" action here.

## Multi-platform scoring

**What it does.** An issue's platform is just a field on its data, and
scoring, health and dossiers treat every platform the same way. Repos the
pipeline has covered include ones hosted on GitHub, GitLab, Gitea,
Phabricator, Bugzilla and Trac.

**How to use it.** Nothing special — a non-GitHub issue looks and scores like
any other on the board.

**What it does not do.** Collecting from a given forge is the scraper's job,
not this repo's; this repo only scores and serves whatever the scraper has
already written.

## The recon API

**What it does.** Every score, health check and dossier the page shows is
also a plain HTTP endpoint under `/aggregator/api/recon/...`, documented in
an OpenAPI spec at `/openapi.json`. Another tool — today,
[hadoku-tenhands](https://github.com/WolffM/hadoku-tenhands) — can read the
same data without the UI.

**How to use it.** `GET /recon/{slug}/scored-issues`, `/health` and
`/dossier` for one repo, or `/recon/all-scored-issues` across every repo the
scraper has written. See [`README.md`](../../README.md#api-usage) for the
full endpoint list.

**What it does not do.** Reads need no key; anything that writes (a claim, or
a trigger to rescrape or recompute) needs friend tier and up, the same as the
page.

## Theming and layout

**What it does.** The board ships with every theme the platform's shared
`@wolffm/themes` package defines, light and dark variants of each family,
and lays out the same on a phone as on a desktop.

**How to use it.** Pick a theme from the picker in the header; nothing
about the board itself needs configuring for a smaller screen.

**What it does not do.** This repo defines no theme of its own — it only
consumes the shared token set, so a new theme added to the platform shows
up here automatically.

## Trivia

The claim status badge has a third state beyond open and claimed: a claim
with no activity for 14 days shows as stale rather than claimed
(`api/recon/precompute.ts`). More trivia is in [trivia.md](trivia.md).
