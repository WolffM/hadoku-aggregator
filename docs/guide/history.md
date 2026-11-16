# OSS Issue Aggregator: history

## A static dashboard (December 2025 – January 2026)

The repo's first commit, "first commit", was a hardcoded list of open-source
projects (`3276f76`, 2025-12-15); "2nd commit" followed the same day
(`7228979`). On 2026-02-01 it grew a Cloudflare Workers API module published
alongside the UI as `@wolffm/oss-aggregator/api` (`1710531`) — the package's
first name, before it became this repo's current one.

## The recon pipeline (February 2026)

Within three weeks the dashboard became the scoring pipeline it is today. On
2026-02-20, a KV reader, a watchlist and claim tracking arrived
(`5925bb9`), and the whole analysis engine — repo health scoring, the
Contribution Viability Score, lifecycle classification and sentiment
analysis — landed in a single commit the same day (`e0ba48f`), followed
hours later by quirk detection and the dossier compiler (`e3ad76c`). Two days
after that the UI was redesigned around it as a "recon intelligence
dashboard" (`88df33c`, 2026-02-22). By 2026-02-26 the old hardcoded project
list and its legacy data path were gone, replaced by projects discovered
dynamically from what the scraper had written to KV (`92037f1`, `8ce6f0f`),
and a pre-computation pipeline moved the heaviest scoring work off the
Cloudflare Worker's own request path (`1dc2965`, 2026-02-24).

## The v3 pipeline and growing up (April–August 2026)

Five endpoints for the pipeline's third version — reading a repo's
`CONTRIBUTING.md`, PR and issue templates, `CODEOWNERS` and labels — shipped
under the internal codename "crimson-kitty" (`199b867`, 2026-04-13). The
package was renamed from `@wolffm/oss-aggregator` to its current
`@wolffm/hadoku-aggregator` on 2026-06-06 (`d3942cc`). A month later the
write-access gate, until then a hand-typed list of admitted tiers, was
rewritten to check rank on the platform's own tier ladder instead
(`7727156`, 2026-07-25), and theming moved onto the platform's shared
`HadokuThemeRoot` (`c723e1b`, 2026-08-05). Days after that, a CI run that
finally typechecked the whole `api/` tree surfaced 303 pre-existing type
errors in code the typecheck had never reached, and fixed them in the same
commit (`e603aa5`, 2026-08-09).

## Removed along the way

| What                                 | Added                | Removed              | Why                                                   |
| ------------------------------------ | -------------------- | -------------------- | ----------------------------------------------------- |
| The hardcoded project list           | `3276f76`, `1710531` | `92037f1`, `8ce6f0f` | repos are discovered dynamically from scraped KV data |
| `oss-api-transplant/`                | `89abcf4`            | `88df33c`            | folded into the recon-dashboard redesign              |
| The tier allowlist on the write gate | `5925bb9`            | `7727156`            | a hand-typed list forgot new tiers; rank does not     |

## Trivia

The recon pipeline module and the whole scoring engine built on it landed
about an hour apart, on the same afternoon (`5925bb9`, `e0ba48f`); more in
[trivia.md](trivia.md).
