# Student OS Regression UAT — 2026-08-19

## Scope and outcome

This regression covers the Cornell Student OS homepage, six browse areas, category filtering, profile setup, resource details, direct links, provenance, responsive behavior, dataset integrity, build output, and deployment configuration.

Outcome: all blocking and high-priority findings in this pass were fixed. The local production build succeeds, all 37 student-facing action URLs returned a successful HTTP response, and no hosted deployment configuration was added.

## User-reported findings

| ID | Severity | Finding | Root cause | Resolution | Acceptance evidence |
|---|---|---|---|---|---|
| UAT-01 | High | Home showed “8 relevant” while Communities showed 10 results. | Home displayed a personalized subset while browse displayed a separately inferred total. | Every category card now displays the same total used by its browse page. Personalized matches are shown as a separate secondary line. | Communities displayed 7 resources on both surfaces after overlap cleanup; browser test confirmed hero count, results label, and rendered cards are identical. |
| UAT-02 | High | School could be skipped even though program and year depend on it. | School, program, and year were modeled as three unrelated optional selects. | Academic home is required and defaults to Cornell-wide. Program and year use “Not specified,” not “Skip.” The whole personalization step may still be skipped. | Browser test confirmed required school, no “Skip” options, and coherent program/year choices. |
| UAT-03 | Medium | No university base URL existed for future extraction. | The prototype assumed Cornell without exposing ingestion configuration. | Added a required university home URL, normalized to the site root and stored locally. The UI states that the current prototype uses curated data. | Profile test confirmed `https://www.cornell.edu/` and required URL validation. |
| UAT-04 | High | Visual theme did not match Cornell and the hero lacked campus imagery. | The shell used a generic green/lime palette and text/search-only hero. | Adopted Cornell Red, warm neutrals, three official Cornell campaign images, and an accessible manual carousel with Ask overlaid on the image. | Desktop and 390×844 browser screenshots confirmed carousel controls, overlay, Cornell palette, single-column mobile flow, and no horizontal overflow. |
| UAT-05 | Critical | Resource actions opened generic or wrong pages; StartupTree was the example. | Provenance pages and student action URLs were stored as the same link. | Primary action and verification source are now separate. StartupTree opens `https://cornell.startuptree.co/`; the Cornell alumni page remains visible provenance. | Browser test inspected both exact `href` values on the StartupTree detail view. |
| UAT-06 | High | Entrepreneurship resources appeared in People & Networks. | Frontend heuristics inferred a primary bucket from kind, domains, and provenance. | Every entity now has one validated `primaryDomain`; broader `domains` remain available for search and relationships. | People & Networks contains only Big Red AI, Cornell Entrepreneur Network, Cornell StartupTree, and CUeLINKS. |

## Additional findings discovered and fixed

### Data trust and links

- The Cornell Tech MBA URL returned 404. It now uses the current official `/programs/masters-programs/` URL.
- Blackstone LaunchPad returned 500 and had been renamed by Cornell in November 2025. The entity is now Launchpad Ezra and uses its exact Entrepreneurship at Cornell detail page.
- The old Johnson student-life URL redirected to the generic business homepage. The card is now Johnson Clubs and Community and uses the current “Why Johnson” page containing the clubs/community content.
- eLab, eHub, Johnson Summer Startup Accelerator, Green Technology Innovation Fellows, Cornell Entrepreneur Network, Mark Mobius Pitch Competition, Capitalista, Gorges Ventures, and the workshop series were moved from generic directories to current exact pages.
- The Generative AI at Cornell standalone domain is parked. The action now goes to its current Cornell directory detail page and the product displays a freshness note.
- The external link audit found two failed responses on its first run and zero after correction: 37/37 discoverable primary URLs succeeded.

### Duplication and overlap

- Removed the synthetic “Cornell Student-built Resources” browse card and replaced it with the verified Cornell AppDev Apps collection.
- Cornell University and Johnson School remain graph nodes but are not browse cards because they are context rather than actionable student resources.
- Johnson Entrepreneurship Track, Johnson Entrepreneurship Community, and the broad Cornell Research & Innovation parent node remain graph context but are hidden from discovery because they overlap more actionable cards.
- The validator now reports shared primary action URLs. Three distinct Johnson resources still share the current official entrepreneurship curriculum page because that page contains named sections for each resource; this is documented rather than silently treated as three independent destinations.

### UX consistency and accessibility

- Category filtering now updates the visible result count as the grid changes.
- Source badges distinguish official Cornell, a school/department, Cornellian/community, and student-built provenance. Cornell Tech is no longer mislabeled Johnson.
- Cards with a profile match now say “Matches your context”; this is not conflated with the category total.
- Detail pages label provenance separately and use the entity's action label instead of the vague “Open original resource.”
- The carousel has descriptive alt text, previous/next controls, position indicators, and no automatic motion.
- At 390×844, the page had a 390px scroll width, one-column category layout, fixed bottom navigation, and no horizontal overflow.

## Base URL ingestion recommendation

The base URL should be configuration, not an in-browser “extract everything” button. A university website contains duplicate pages, archives, PDFs, authenticated portals, marketing pages, and external systems; crawling it directly from the browser would also encounter CORS and policy constraints.

Recommended future ingestion flow:

1. accept university root URL and approved source domains;
2. discover URLs from sitemaps and bounded crawls that respect source policies;
3. follow redirects and canonicalize exact destinations;
4. classify provenance, entity kind, primary discovery domain, and audience;
5. deduplicate by canonical URL and normalized identity;
6. flag stale, login-only, parked, or generic directory pages;
7. require human approval before publishing.

The MVP now captures the root URL but intentionally does not claim automatic extraction.

## Regression matrix

| Area | Checks | Result |
|---|---|---|
| Dataset schema | required fields, valid kinds/domains/sources, `primaryDomain`, source URLs, primary links | Pass |
| Graph | unique relationship IDs and valid entity references | Pass |
| Duplicates | duplicate IDs/names, synthetic collection, shared action URLs | Pass with one documented shared-page warning |
| Browse counts | home total, category hero, results label, rendered cards | Pass |
| Filtering | grid content and result label update together | Pass |
| Taxonomy | each discoverable entity appears in one primary area | Pass |
| Profile | required school, optional coherent program/year, base URL | Pass |
| Detail actions | exact action link and separate provenance link | Pass |
| Responsive | desktop and 390×844; no horizontal overflow | Pass |
| Build | Vite production build | Pass |
| Deployment | `.openai/hosting.json` absent; local-only instructions | Pass |

## Commands and test evidence

```text
npm run validate:data
Validated 42 entities and 43 relationships.

npm run build
Vite production build succeeded.

git diff --check
No whitespace errors.

External primary-link audit
37 checked; 0 non-2xx/network responses.
```

## Remaining product risks

1. Live events are not indexed; current-event questions hand off to verified Cornell calendars.
2. No individual public people profiles are included pending privacy and verification rules.
3. Student-built coverage is still thin at two student-facing results.
4. Medium-confidence curated relationship edges should not be rendered as authoritative factual claims.
5. The prototype stores personalization locally and has no cross-device identity or sync.
