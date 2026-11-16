---
title: OSS Issue Aggregator
summary: >-
  Scores open-source issues for how likely they are to turn into a merged
  pull request, reading data a companion scraping service has already
  collected and serving the scores, repo health and a contribution dossier
  for each repo as a page and a plain API, live at
  [hadoku.me/aggregator](https://hadoku.me/aggregator).
features:
  - name: Browsing scored issues
    summary: 'Shows open issues as a table or a card board, ranked by how likely a contribution is to land.'
    anchor: browsing-scored-issues
  - name: Repo health
    summary: 'Shows maintainer activity, how easy a merge is, and whether a repo looks abandoned.'
    anchor: repo-health
  - name: Contribution dossiers
    summary: 'Compiles a six-section guide to contributing to one repo.'
    anchor: contribution-dossiers
  - name: Claiming an issue
    summary: 'Mark an issue as being worked, so two people or agents do not duplicate it.'
    anchor: claiming-an-issue
    tier: friend
  - name: Picking which repos to watch
    summary: 'Choose which scraped repos show up in your own board.'
    anchor: picking-which-repos-to-watch
  - name: Multi-platform scoring
    summary: 'Scores an issue the same way whichever forge it came from.'
    anchor: multi-platform-scoring
  - name: The recon API
    summary: 'Every score, health check and dossier is also a plain HTTP endpoint.'
    anchor: the-recon-api
trivia:
  - 'The whole scoring engine — repo health, issue viability, lifecycle, sentiment — landed in one commit (`e0ba48f`).'
  - 'The biggest commit in the repo touched 32,410 lines across 84 files and changed no behavior at all: it normalized every file to LF line endings (`104ed30`).'
  - 'Five endpoints for the contribution pipeline''s third version shipped under the internal codename "crimson-kitty" (`199b867`).'
  - "The write-access gate used to be a hand-typed list of tiers; it now loops over the platform's own tier ranking, so a tier added above friend needs no one to remember to add it (`7727156`)."
---

# OSS Issue Aggregator

The aggregator is the scoring and API layer of a small pipeline for finding
open-source issues worth assigning a contributor to, live at
[hadoku.me/aggregator](https://hadoku.me/aggregator). A companion scraping
service collects issue, pull-request and repo data from the forges it
watches; this repo reads that data, scores it, and serves the result — to its
own page, and to any other tool that calls its API.

![The OSS Issues board: open issues across watched repos, ranked by Contribution Viability Score (CVS), each with a lifecycle tag and complexity](images/board.webp)

Scoring combines a repo's health (is it maintained, is a merge realistic),
an issue's own signals (freshness, activity, how clear it is, how much
competition it has) and whether anyone has already claimed it into one 0–100
**Contribution Viability Score**. The page itself is read-only for anyone who
opens it; claiming an issue, or anything else that writes, needs a signed-in
friend tier or above.

- [Features](features.md): what each part does and how to use it.
- [Contributing](contributing.md): running it locally, how it is built, how it deploys.
- [History](history.md): from a static dashboard to a scored, multi-repo pipeline.
- [Trivia](trivia.md)

## Trivia

The repo health score, the issue viability score, lifecycle classification
and sentiment analysis — the whole engine the app is named for — shipped in
a single commit ([history](history.md#the-recon-pipeline-february-2026)).
