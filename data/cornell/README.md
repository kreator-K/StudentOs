# Cornell Student OS Seed Dataset

Last verified: 2026-08-17

This is a curated, source-linked seed dataset for the Cornell Student OS MVP. It is intentionally not a comprehensive map of Cornell. The dataset is designed to demonstrate discovery and cross-category navigation across communities, people-discovery platforms, events, opportunities, entrepreneurship, and student-built resources.

## Contents

- `entities.json` — 42 structured Cornell entities.
- `relationships.json` — 44 directed relationships between entities.

## Entity counts

| Kind | Count |
|---|---:|
| organization | 7 |
| network | 10 |
| community | 6 |
| service | 4 |
| program | 8 |
| opportunity | 3 |
| event | 2 |
| place | 1 |
| student_resource | 1 |
| **Total** | **42** |

Note: the counts above are grouped by underlying `kind`; an entity can appear in multiple student-facing `domains`.

## Source counts

| Source type | Count |
|---|---:|
| official_university | 27 |
| official_school_department | 11 |
| student_built | 3 |
| cornellian_community | 1 |
| external | 0 |

## Source list

- Cornell University — https://www.cornell.edu/
- Cornell CampusGroups — https://cornell.campusgroups.com/
- Cornell Events — https://events.cornell.edu/
- CUeLINKS — https://cuelinks.cornell.edu/
- Cornell Career Services — https://career.cornell.edu/
- Cornell Career Experiences — https://career.cornell.edu/experiences/
- Johnson School of Management — https://www.johnson.cornell.edu/
- Johnson student life — https://www.johnson.cornell.edu/experience/student-life/
- Johnson career support — https://business.cornell.edu/career-support/
- Entrepreneurship at Cornell — https://eship.cornell.edu/
- Entrepreneurship ecosystem listings — https://eship.cornell.edu/all-listings/
- Cornell eLab — https://elab.cornell.edu/
- Blackstone LaunchPad — https://eship.cornell.edu/blackstone-launchpad/
- Center for Regional Economic Advancement — https://crea.cornell.edu/on-campus-entrepreneurship-programs/
- Cañizares Center for Emerging Markets — https://business.cornell.edu/centers/ccem/
- Undergraduate Research at Cornell — https://undergraduateresearch.cornell.edu/
- Cornell Research & Innovation — https://research-and-innovation.cornell.edu/innovation-entrepreneurship/
- Cornell AppDev — https://www.cornellappdev.com/
- JCT MBA Fall 2026 Course Planner — https://jctmba27.vercel.app/
- Big Red AI — https://bigredai.org/
- Cornell entrepreneurial resources — https://alumni.cornell.edu/connect/networking/cen/resources/

## Notable connected paths

The dataset supports paths such as:

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
→ Johnson Entrepreneurship Curriculum
→ eLab
→ Johnson Summer Startup Accelerator
→ Big Red Venture Fund
→ Big Red Tech Strategy
```

```text
Emerging markets
→ Cañizares Center for Emerging Markets
→ Mark Mobius Pitch Competition
→ Cornell Entrepreneur Network
```

```text
Cornell Tech MBA
→ JCT MBA Fall 2026 Course Planner
→ Cornell Student-built Resources
```

## Validation notes

- Every entity has a non-empty source URL and source type.
- Every entity has a primary external link.
- Relationship references are validated against entity IDs.
- No duplicate entity IDs are present.
- Near-duplicate event records were consolidated so a resource appears once in its primary discovery area; other contexts are represented through relationships.
- Student-built entities are explicitly labeled with `source.sourceType: student_built`.
- Dates and deadlines were omitted unless a directly verified date was available. The current seed therefore contains no fabricated event dates or application deadlines.
- Several entrepreneurship entities use the official ecosystem listing page as their source because it verifies the listing but does not expose a stable direct detail URL in the source material reviewed.
- No individual person entities were added. CUeLINKS, Big Red AI, Cornell StartupTree, and related networks provide people-discovery entry points, but individual profiles require separate verification and privacy review.

## Gaps and next validation pass

1. Add verified individual public profiles for founders, mentors, faculty, or student leaders only where a direct profile and appropriate public-use basis exist.
2. Add more verified events with exact dates, times, locations, and registration links.
3. Add more communities from CampusGroups and Johnson student life with direct organization URLs and current-term activity status.
4. Verify the Cornell Tech MBA URL and the current maintenance status of the JCT course planner.
5. Add verified student-built resources beyond Cornell AppDev and the JCT course planner; do not infer student-built status from appearance alone.
6. Replace ecosystem-directory links with direct detail URLs when stable, useful detail pages are available.
7. Add source-specific freshness checks before demo data is treated as production content.

## Assumptions

- A resource listed by an official Cornell ecosystem directory is treated as existing and source-verified, even when a separate direct detail page is not available.
- Entrepreneurship is modeled as a student-facing domain rather than a single underlying entity kind.
- Student-built is modeled both as a domain and as provenance.
- Some relationships are marked `medium` where they represent a curated discovery connection rather than an explicit source-stated relationship. These should be reviewed before use in authoritative UI copy.
- The dataset is Cornell-specific in content but uses university-neutral entity and relationship fields so another university can replace the entity records without changing the schema.
