# Student OS

Student OS is a Cornell-focused discovery layer for the university ecosystem. It helps students explore communities, people and networks, events, opportunities, entrepreneurship resources, and student-built tools in one connected experience.

## Run locally

```bash
npm install
npm run dev
```

Open the local Vite URL shown in the terminal. The prototype uses Cornell as its configured university and stores optional personalization in browser local storage only.

## Checks

```bash
npm run validate:data
npm run build
```

There is no backend, authentication, API key, or AI service in this prototype. Ask uses deterministic search, discovery, and relationship traversal over the local Cornell dataset.

## Dataset

The source dataset is in [`data/cornell/`](data/cornell/):

- `entities.json` contains unified Cornell entities with domains, one explicit student-facing `primaryDomain`, audience, provenance, direct action URLs, tags, and verification dates.
- `relationships.json` contains directed connections between entity IDs.
- `README.md` records dataset scope, provenance, gaps, and assumptions.

To update the dataset, edit the JSON records, preserve stable IDs, add or update source URLs and verification dates, then run `npm run validate:data` before running the production build. Broad context nodes may use `discoverable: false` so they remain available to the graph without creating duplicate or non-actionable browse cards.

## University setup and URL ingestion

Profile setup includes a required academic home and a university home URL. The URL is normalized and stored locally as future ingestion configuration; the browser does not crawl the university website.

A scalable ingestion flow should run separately from the student-facing client:

1. discover candidates from the university root, sitemaps, and approved source lists;
2. canonicalize redirects and exact resource URLs;
3. classify provenance and the primary discovery domain;
4. detect duplicates and stale pages;
5. require human approval before publishing entities or relationships.

This separation avoids CORS limitations, respects source policies, and keeps unverified pages out of student-facing results.

## Ask and discovery

Ask is intentionally deterministic and dataset-grounded. It tokenizes the query, ranks matching entity metadata and relationship names, detects a small set of intents, and builds a Journey only by traversing existing relationship edges. Unsupported queries fall back to grouped results or an empty state; the client does not call an LLM.

## Deployment

Student OS is currently local-only. Run `npm run dev` for development or `npm run build` to generate the static Vite output. No hosted deployment is configured and no environment variables are required.

## Latest hardening pass

The regression release makes category totals consistent across home and browse views, separates profile matches from total resources, validates one explicit primary discovery domain per resource, hides overlapping context nodes, and keeps filtered result counts live. It updates stale/direct URLs, visibly separates action links from provenance, and replaces the synthetic student-built collection with verified Cornell AppDev apps.

The interface now uses Cornell Red, official Cornell campus imagery, an accessible manual hero carousel with the Ask experience overlaid, required academic-home setup, context-aware navigation, a mobile bottom navigation bar, independent card actions, a skip link, and keyboard-safe onboarding behavior.

## Competition demo

See [`docs/demo.md`](docs/demo.md) for the locked two-minute demo path and canonical entity IDs.

## Product audit

The latest senior PM review is documented in [`docs/uat-product-audit.md`](docs/uat-product-audit.md). It covers UAT results, taxonomy and duplication risks, search quality, mobile/accessibility findings, data-trust gaps, and prioritized recommendations.

The implementation regression and issue-by-issue acceptance results are documented in [`docs/regression-uat-2026-08-19.md`](docs/regression-uat-2026-08-19.md).
