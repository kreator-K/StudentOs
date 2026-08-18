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

- `entities.json` contains unified Cornell entities with domains, audience, provenance, tags, source URLs, and verification dates.
- `relationships.json` contains directed connections between entity IDs.
- `README.md` records dataset scope, provenance, gaps, and assumptions.

To update the dataset, edit the JSON records, preserve stable IDs, add or update source URLs and verification dates, then run `npm run validate:data` before running the production build.

## Ask and discovery

Ask is intentionally deterministic and dataset-grounded. It tokenizes the query, ranks matching entity metadata and relationship names, detects a small set of intents, and builds a Journey only by traversing existing relationship edges. Unsupported queries fall back to grouped results or an empty state; the client does not call an LLM.

## Deployment

The app is a static Vite build. Run `npm run build` and deploy the generated `dist/` directory to a static host. No environment variables are required.

## Competition demo

See [`docs/demo.md`](docs/demo.md) for the locked two-minute demo path and canonical entity IDs.
