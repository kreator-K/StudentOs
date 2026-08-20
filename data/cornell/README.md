# Cornell Student OS Seed Dataset

Last verified: 2026-08-19

This is a curated, source-linked seed dataset for the Cornell Student OS MVP. It is intentionally not a comprehensive map of Cornell. The unified graph contains 42 entities and 43 relationships; 37 entities are student-facing discovery results and five are retained only as graph context to prevent duplicate or non-actionable cards.

## Contents

- `entities.json` — unified entities with provenance, direct action URLs, audience, tags, one explicit `primaryDomain`, and optional `discoverable` state.
- `relationships.json` — directed, confidence-labelled connections between entity IDs.

## Entity counts

| Kind | Count |
|---|---:|
| organization | 7 |
| network | 9 |
| community | 6 |
| service | 4 |
| program | 8 |
| opportunity | 3 |
| event | 2 |
| place | 1 |
| student_resource | 2 |
| **Total** | **42** |

## Student-facing discovery counts

| Primary domain | Count |
|---|---:|
| Communities | 7 |
| People & Networks | 4 |
| Events | 3 |
| Opportunities | 8 |
| Entrepreneurship | 13 |
| Student-built | 2 |
| **Discoverable total** | **37** |

The remaining five entities are graph context. They support relationships but are not shown as standalone cards because they duplicate a more actionable resource or are too broad to be useful discovery results.

## Source counts

| Source type | Count |
|---|---:|
| official_university | 24 |
| official_school_department | 11 |
| cornellian_community | 4 |
| student_built | 3 |
| external | 0 |

## Principal sources

- Cornell University — https://www.cornell.edu/
- Cornell CampusGroups — https://cornell.campusgroups.com/
- Cornell Events — https://events.cornell.edu/
- CUeLINKS — https://cuelinks.cornell.edu/
- Cornell Career Services — https://career.cornell.edu/
- Cornell SC Johnson College of Business — https://business.cornell.edu/
- Cornell Tech — https://tech.cornell.edu/
- Entrepreneurship at Cornell — https://eship.cornell.edu/
- Cornell Research & Innovation — https://research-and-innovation.cornell.edu/
- Cañizares Center for Emerging Markets — https://business.cornell.edu/centers/ccem/
- Cornell Student & Campus Life — https://scl.cornell.edu/
- Undergraduate Research at Cornell — https://undergraduateresearch.cornell.edu/
- Cornell AppDev — https://www.cornellappdev.com/
- JCT MBA Fall 2026 Course Planner — https://jctmba27.vercel.app/
- Big Red AI — https://bigredai.org/
- Cornell StartupTree — https://cornell.startuptree.co/

## Validation results

- All 42 entity IDs and all 43 relationship IDs are unique.
- Every entity has a valid source type, source URL, direct primary link, and `primaryDomain`.
- Every primary domain is one of the six portable Student OS discovery areas and also appears in the entity's broader `domains` list.
- All relationship endpoints resolve to existing entity IDs.
- Student-built provenance requires `studentBuilt: true`; official and Cornellian/community resources remain distinguishable.
- Generic directory pages are rejected as primary actions unless the entity is itself that directory.
- An external HTTP audit on 2026-08-19 checked all 37 discoverable primary links and received a successful response from every one.
- Duplicate primary URLs are reported for review. The remaining shared Johnson entrepreneurship page contains distinct, named sections for the curriculum, Big Red Venture Fund, and Big Red Tech Strategy.

## Notable changes from the previous seed

- Cornell StartupTree now opens `https://cornell.startuptree.co/`; the Cornell alumni page remains provenance.
- Blackstone LaunchPad was updated to its current name, Launchpad Ezra, and its exact Cornell detail page.
- Cornell Tech MBA, eLab, eHub, Mark Mobius Pitch Competition, Capitalista, Gorges Ventures, Green Technology Innovation Fellows, and the workshop series now use current direct pages.
- The parked Generative AI at Cornell domain is no longer used. Its current Cornell directory detail page is the action URL and carries a visible freshness note.
- A synthetic “Cornell Student-built Resources” card was replaced with the verified Cornell AppDev Apps collection.
- Broad university nodes and overlapping Johnson/research nodes remain in the graph but are hidden from browse/search results.

## Notable connected paths

```text
AI
→ Big Red AI
→ Generative AI at Cornell
→ Cornell StartupTree
→ Entrepreneurship at Cornell
→ eLab
```

```text
Johnson MBA
→ Johnson MBA Entrepreneurship Curriculum
→ eLab
→ Johnson Summer Startup Accelerator
→ Big Red Venture Fund
```

```text
Cornell Tech MBA
→ JCT MBA Fall 2026 Course Planner
```

## Gaps and assumptions

1. No individual person profiles are included; public-profile verification and privacy review are still required.
2. Live event dates are not indexed, so the product hands students to verified Cornell event calendars.
3. The dataset has only two student-facing student-built results. Expansion must use individually verified tools, not hypothetical examples.
4. Some relationship edges are marked `medium` because they are curated discovery connections rather than source-stated facts.
5. A university base URL is useful ingestion configuration, but it is not sufficient evidence by itself. Future ingestion should combine sitemaps/crawling, canonical URL handling, source classification, deduplication, and human approval.
6. Content is Cornell-specific, but the schema and six `primaryDomain` values are university-neutral.
