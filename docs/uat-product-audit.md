# Student OS — Product Audit and UAT Review

**Review date:** 2026-08-19 · **Scope:** Cornell Student OS MVP · **Review mode:** Senior PM product audit and acceptance testing
**Implementation changes:** None

## Executive verdict

Student OS has a strong Campus Connection concept and a credible competition-demo shell. It is technically stable, but it is not ready for unguided student UAT yet.

The largest risks are not build failures. They are semantic accuracy, duplicate presentation, weak event freshness, search false positives, and mobile navigation.

**Decision: ready for a guided competition demo after targeted P0 fixes; not ready for unguided student UAT.**

## What was tested

- Cold launch and first-session onboarding
- Home, Explore, Discover, Saved, Profile, category, entity, and Ask flows
- Entrepreneurship, AI, founders, people, events, student-built, and impossible-query prompts
- Search filtering and empty states
- Save and retrieve behavior
- Personalization with Johnson MBA Year 1, AI, and Entrepreneurship
- Desktop, tablet, and mobile layouts
- Basic accessibility semantics and focus behavior
- Dataset validation and production build
- Source spot checks for Cornell Events, CampusGroups, Big Red AI, CUeLINKS, eLab, and student-built resources

## UAT summary

| Area | Result | Finding |
|---|---|---|
| Cold launch | Partial pass | The value proposition is clear, but onboarding interrupts exploration immediately. |
| Explore | Partial pass | Navigation works, but category meaning is inconsistent. |
| Ask | Partial pass | Exact searches can work, but broad and unsupported prompts produce misleading results. |
| Connected journeys | Partial pass | Journeys are the strongest differentiator, but some stage labels and edges are semantically weak. |
| Discovery | Partial pass | History-based discovery improves after exploration; cold-profile discovery is repetitive and poorly explained. |
| Events | Fail | The app does not expose current dates, times, locations, or real event occurrences. |
| People | Partial fail | The category contains networks and services but no individual people. |
| Student-built | Partial fail | The category includes official entities because it is based on domains instead of provenance. |
| Saved | Pass | Saving and retrieval work. |
| Mobile | Fail | The top navigation is clipped at 390px and hides access to some destinations. |
| Accessibility | Partial fail | Labels exist, but modal focus, background isolation, and nested interactive controls need work. |
| Runtime | Pass | Build succeeds, validation passes, and no browser console errors appeared. |
| Deployment | Not testable | No public deployment is configured in the repository. |

## Critical product gaps

### 1. Category semantics do not match the UI promise

The data model is intentionally multi-domain, but the frontend presents domains as if they were exclusive categories.

Current measurements:

- 45 total entities
- 41 entities belong to more than one domain
- 127 domain appearances across 45 canonical entities
- Average entity appears in 2.82 domains
- People and Opportunities share 84% of the smaller category
- Opportunities and Entrepreneurship share 77% of the smaller category
- Communities and Events share 67% of the smaller category

Examples:

- Cornell University appears in all six student-facing areas.
- Green Technology Innovation Fellows appears in People even though it is an opportunity.
- Cornell Events appears under Events, People, Communities, Opportunities, and Entrepreneurship through related-domain expansion.
- Student-built includes Cornell University and Cornell Tech MBA, although neither has `source.sourceType: student_built`.

Recommended direction:

- Keep one canonical entity with multiple facets.
- Add a `primaryDomain` or presentation role.
- Rank primary-domain matches first.
- Display secondary domains as “Also relevant to…” facets.
- Base Student-built membership on provenance, not domain membership.
- Rename People to **People & Networks** until verified individual profiles are added.

### 2. Related content is rendered more than three times larger than the graph

There are 92 unique relationship appearances, but approximately 302 rendered related rows because one related entity is repeated under each of its domains.

Examples:

- Cornell Events has one unique related entity but renders it under six headings.
- eLab has three unique related entities but renders nine rows.
- Big Red AI has three unique related entities but renders eleven rows.
- Johnson School has ten unique related entities but renders twenty-four rows.

Recommended direction:

- Deduplicate related entities by ID.
- Group by relationship type rather than domain.
- Preserve relationship direction.
- Show secondary domain badges inside one row.
- Use labels such as “Offered by,” “Hosted by,” “Useful for,” and “Part of.”

### 3. Ask can sound confident when it should say “no match”

Observed issues:

- “Find me a Cornell fencing tournament on Mars” returns generic Cornell resources.
- “What is happening this week?” returns platforms and organizations without current dates.
- “Find people interested in technology” returns programs and institutions under People.
- “Student-built tools for course planning” returns unrelated results before the actual planner.
- “Show me something I did not know exists” fails because discovery intent recognizes only a narrow set of phrases.
- Search matches related-entity names without explaining that this caused the match.

Recommended direction:

- Remove generic institution terms from ranking.
- Require at least one discriminating query signal.
- Weight exact names, direct tags, kind, and descriptions above related names.
- Add confidence thresholds and an explicit no-match state.
- Add date-aware handling for “today,” “this week,” and “upcoming.”
- Expand natural-language discovery intent patterns.
- Present “Best matches” before category groupings.

### 4. Events do not fulfill the current-information promise

The official [Cornell Events calendar](https://events.cornell.edu/) exposes dates, times, locations, filters, and current event occurrences. [Cornell CampusGroups](https://cornell.campusgroups.com/) exposes active groups and upcoming events.

Student OS currently represents most event records as generic, undated resource cards. The dataset contains no verified event dates or deadlines.

Recommended direction:

- Add 8–12 verified event occurrences.
- Require start time, timezone, location or virtual status, host, registration URL, and freshness.
- Distinguish event platforms from event occurrences.
- Expire past events.
- Make “What’s happening this week?” return current events or an honest limitation.

### 5. People is a promise–delivery mismatch

The People category contains networking platforms, schools, services, programs, and organizations. There are no individual person entities.

Recommended direction:

- Rename the category to People & Networks for the current MVP.
- Add a small number of verified public people profiles only where role and public-use basis are clear.
- Separate “find people” from “find systems that help you find people.”

### 6. Mobile navigation is incomplete

At 390px the top navigation extends past the viewport and is clipped by the app shell. Saved and Profile are not reliably accessible, and there is no mobile menu or bottom-navigation fallback.

Recommended direction:

- Add a compact mobile navigation pattern.
- Keep Home, Explore, Discover, and Saved visible or reachable with one tap.
- Add an active-route state.
- Test at 320px, 375px, 390px, and 430px.

### 7. Personalization explains itself inaccurately

With AI and Entrepreneurship selected for a Johnson MBA Year 1 profile, the five initial discovery cards all cited Entrepreneurship. Big Red AI did not appear in the cold-profile discovery set. After Big Red AI was viewed, history-based discovery improved and showed related resources.

Recommended direction:

- Explain the actual matching factor, not the first selected interest.
- Balance recommendations across selected interests.
- Reserve slots for serendipity and student-built resources.
- Only collect profile fields that materially affect ranking.
- Show transparent “Why this?” explanations.

## Duplicate records requiring editorial resolution

| Records | Risk | Recommendation |
|---|---|---|
| Cornell EMI Mark Mobius Pitch Competition / Mark Mobius Pitch Competition | Likely the same real-world competition represented as both opportunity and event | Keep both only if the event has its own date and registration URL; otherwise merge. |
| Innovation & Entrepreneurship Workshop Series / Cornell Innovation & Entrepreneurship Workshops | Similar description and identical source destination | Merge until separate occurrences are verified. |
| Cornell Entrepreneur Network / Cornell Entrepreneur Network Events | Network and event collection share the same landing page and have no dates | Keep the network; add dated event occurrences later. |
| Cornell AppDev / Cornell Student-built Resources | Organization and meta-collection overlap | Keep AppDev; replace the meta record with actual student-built products or a clearly labeled collection. |
| Cornell Student Organization Discovery / Cornell ClubFest | Valid service/event distinction, but ClubFest lacks a current occurrence date | Keep both and add event-specific freshness. |

## Hidden trust and provenance information

The data model contains important information that is not visible in the product:

- Three entities lack `lastVerifiedAt`.
- Five relationships have medium confidence.
- All 47 relationships lack relationship-specific evidence fields.
- The JCT planner has `maintenanceStatus: unknown`, but the UI does not show it.
- Relationship direction is flattened during traversal.
- The UI calls journeys “verified paths” even when medium-confidence edges can be included.
- Audience data exists for only 16 of 45 entities.
- There are no eligibility or deadline records.

Recommended direction:

- Exclude unreviewed edges from “verified” journeys.
- Store relationship evidence URLs and verification dates.
- Use directional labels in detail pages and journeys.
- Add freshness and maintenance indicators for student-built resources.
- Treat missing audience, eligibility, and dates as unknown rather than implied.

## Accessibility findings

Positive:

- Inputs have accessible labels.
- Buttons have accessible names.
- Main landmarks and heading structure are present.
- Visible focus styling exists.

Gaps:

- Onboarding opens with focus on the document body.
- Background content is not inert while the modal is open.
- There is no focus trap or Escape behavior.
- Entity cards use `role="button"` while containing Save buttons.
- There is no skip-to-content link.
- No navigation item exposes the current route.

## Recommended delivery sequence

### Before the next judge walkthrough

1. Fix mobile navigation.
2. Deduplicate Related sections.
3. Correct Student-built category membership.
4. Rename People to People & Networks.
5. Add honest no-match and date-aware Ask behavior.
6. Preserve category context on Back.
7. Resolve obvious duplicate records.
8. Remove “verified path” claims from unreviewed journeys.
9. Configure and test a public deployment.

### Before student UAT

1. Add current dated events.
2. Add verified people or revise the category promise.
3. Add opportunity deadlines and eligibility.
4. Add primary-domain presentation rules.
5. Add relationship evidence and directional labels.
6. Improve personalization diversity and explanations.
7. Add useful filters and sorting.
8. Establish freshness and broken-link monitoring.

## Open product questions

1. Is the primary persona all Cornell students or specifically Johnson MBA students?
2. Should People mean actual individuals, or is People & Networks acceptable for the competition?
3. Is Student-built strictly a provenance category?
4. Is “What’s happening this week?” a required MVP promise?
5. Are repeated cards pointing to the same landing page intentional abstractions, or should each card map to a distinct action?

## Validation record

- `npm run validate:data` passed: 45 entities and 47 relationships.
- Validation reported 8 documented warnings.
- `npm run build` passed.
- `git diff --check` passed.
- Browser UAT found no console errors.
- No application or dataset changes were made during the audit.
