# OSS Issue Aggregator

**Guide:** [overview](docs/guide/index.md) · [features](docs/guide/features.md) · [contributing](docs/guide/contributing.md) · [history](docs/guide/history.md) · [trivia](docs/guide/trivia.md)

> Intelligence + API layer for the OSS contribution pipeline

Scores open source issues for contribution viability, analyzes repo health, and compiles contribution dossiers. Part of a small pipeline: a private scraping service (data collection) → **hadoku-aggregator** (this repo: analysis + API) → [hadoku-tenhands](https://github.com/WolffM/hadoku-tenhands) (fork/PR orchestration + UI).

**Live at:** [hadoku.me/aggregator](https://hadoku.me/aggregator)

## Features

What each part does and how to use it — scoring, repo health and quirk
detection, dossiers, issue claiming, multi-platform support, and theming —
is in [docs/guide/features.md](docs/guide/features.md).

## Package Exports

This package provides both UI components and API logic:

```typescript
// UI components (React)
import { OSSAggregator } from '@wolffm/hadoku-aggregator'
import '@wolffm/hadoku-aggregator/style.css'

// API handler (Cloudflare Workers)
import { createOSSHandler, type OSSEnv } from '@wolffm/hadoku-aggregator/api'
```

Running it locally, the build and the dist/ output layout are in
[contributing.md](docs/guide/contributing.md).

## API Usage

### For Cloudflare Workers

```typescript
import { createOSSHandler, type OSSEnv } from '@wolffm/hadoku-aggregator/api'

// Create handler with base path
const app = createOSSHandler('/oss/api')

export default app
```

### Environment Variables

| Variable             | Required | Description                                                   |
| -------------------- | -------- | ------------------------------------------------------------- |
| `CACHE_KV`           | Yes      | Cloudflare KV namespace binding                               |
| `SCRAPER_API_URL`    | Yes      | base URL of the (private) scraping service, for trigger calls |
| `HADOKU_SERVICE_KEY` | Yes      | Service-tier key sent as `X-User-Key`                         |
| `GITHUB_TOKEN`       | Optional | GitHub PAT (legacy, used by marking system)                   |
| `PHABRICATOR_TOKEN`  | Optional | Phabricator API token (legacy)                                |

### API Endpoints

All paths are relative to the base path (e.g., `/oss/api`).

#### Health & Marking

| Method | Endpoint                 | Description                     |
| ------ | ------------------------ | ------------------------------- |
| GET    | `/health`                | Health check                    |
| GET    | `/openapi.json`          | OpenAPI specification           |
| POST   | `/issues/{issueId}/mark` | Mark an issue (ignored/process) |
| DELETE | `/issues/{issueId}/mark` | Unmark an issue                 |
| GET    | `/issues/marked`         | Get marked issues by status     |

#### Recon Pipeline — Per-Repo Data

| Method | Endpoint                              | Description                              |
| ------ | ------------------------------------- | ---------------------------------------- |
| GET    | `/recon/{slug}/health`                | Computed repo health scores              |
| GET    | `/recon/{slug}/issues`                | Raw unscored issues from KV              |
| GET    | `/recon/{slug}/scored-issues`         | Issues with CVS scores                   |
| GET    | `/recon/{slug}/dossier`               | Contribution intelligence dossier        |
| GET    | `/recon/{slug}/issue-brief/{issueId}` | SWE agent execution context for an issue |
| GET    | `/recon/all-scored-issues`            | All scored issues across all repos       |

#### Recon Pipeline — Claims & Triggers

| Method | Endpoint                | Description                       |
| ------ | ----------------------- | --------------------------------- |
| POST   | `/recon/{slug}/claim`   | Report an issue claim             |
| POST   | `/recon/{slug}/unclaim` | Remove an issue claim             |
| POST   | `/recon/{slug}/refresh` | Trigger scraper re-scrape         |
| POST   | `/recon/{slug}/compute` | Pre-compute scores/health/dossier |
| POST   | `/recon/compute-all`    | Pre-compute for all scraped repos |

## Data Flow

```
Scraping service, private (cron)
  │  fetches from upstream APIs
  │  writes consolidated data to KV
  ▼
Cloudflare KV
  │  recon:{slug}              → scraper data (issues, PRs, meta, comments)
  │  recon:{slug}:health       → aggregator-computed health scores
  │  recon:{slug}:scored-issues → CVS-scored issues
  │  recon:{slug}:dossier      → compiled dossier
  │  recon:{slug}:claims       → claim tracking
  ▼
hadoku-aggregator API (this repo)
  │  reads scraper data, runs analysis, serves results
  ▼
hadoku-tenhands (UI + fork/PR workflow)
```

## Versioning and deployment

See [contributing.md](docs/guide/contributing.md#how-it-deploys): the
version is CI's, never a commit's.

## License

MIT
