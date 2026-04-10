# Storefront Ops Operating Model

Use this document to define how the storefront runs after launch.

## Objectives

- Keep pricing, trust pages, and published SKUs from drifting silently
- Maintain a visible review queue for page quality, indexing risks, and publish blockers
- Separate mechanical checks from merchandising and trust judgement

## Weekly Cadence

- `Monday`: review KPI deltas, indexing issues, and the weekly ops summary
- `Tuesday`: review QA samples across homepage, collection, PDP, and trust pages
- `Wednesday`: review publish readiness, copy-risk flags, and unresolved blockers
- `Thursday`: ship approved fixes, merchandising updates, or policy-page corrections
- `Friday`: publish the weekly ops review and roll unfinished work into the next cycle

## Monthly Cadence

- review experiment outcomes and unresolved blockers
- identify the largest current trust, conversion, or indexing constraint
- update `OPERATING_PLAN.md`, `CONTENT_CALENDAR.md`, `KPI_SCORECARD.md`, and `EXPERIMENT_LOG.md`
- define the next-stage plan with only a small number of clear actions

## Operating Model

Default model:

- `single owner`
- `multiple executors`

That means:

- one final owner approves direction and release timing
- human, agent, and system executors can each handle bounded work
- automation drafts, checks, and queues work
- owner approval remains the gate for riskier publish decisions

## Roles

- `Operator`: runs checks, updates logs, and keeps the queue moving
- `Editor`: reviews trust language, product-copy claims, and on-page clarity
- `Owner`: approves publish timing, category changes, and riskier site-wide edits
- `Agent Executor`: drafts reviews, summaries, and queue suggestions
- `System Executor`: runs scripts, generates checks, and produces governance outputs

## Core Artifacts

- `OPERATING_PLAN.md`: site positioning and operating priorities
- `KPI_SCORECARD.md`: visible metric deltas and weekly signal tracking
- `EXPERIMENT_LOG.md`: controlled changes and outcomes
- `ops/quality-review-sop.md`: page QA and sampling rules
- `ops/publishing-sop.md`: release decision path
- `ops/incident-response-sop.md`: rollback and anomaly handling
- `ops/automation-backlog.md`: what should be automated next
- `ops/generated/qa-sampling-queue.md`: current review sample set
- `ops/generated/publish-gate.md`: current publish recommendation

## Decision Gates

- Publish only if trust pages are intact and checkout protections remain in place
- Publish only if representative pages still read clearly and support their claims
- Escalate when category structure changes, multiple URLs become thin, or support content degrades

## Notes

- Keep this file short. Put detailed procedures in the SOP documents under `ops/`.
- Prefer one focused fix per cycle over many overlapping changes that cannot be attributed.
