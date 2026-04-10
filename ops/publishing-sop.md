# Publishing SOP

This SOP defines how the storefront moves from approved work to public release.

It is not a deploy command checklist.
It is the operating publish gate for merchandising, trust, and page-quality changes.

## Trigger Events

- New product batch or significant product-copy update
- Policy, support, or trust-page change
- Homepage, collection, or merchandising change
- SEO/indexing remediation

## Inputs

- Latest build output
- Latest `npm run validate:copy` result
- Latest `npm run validate:ops` result
- Spot-check samples for homepage, collection, PDP, and trust pages
- Latest notes in `ops/ops-execution-log.md`

## Steps

1. Run `npm run validate:copy`.
2. Run `npm run validate:ops`.
3. Review the generated QA sampling queue.
4. Sample representative pages across homepage, collection, PDP, and trust pages.
5. Confirm metadata, support details, merchandising modules, and indexing intent still make sense.
6. Record any holds, decisions, or overrides in `ops/ops-execution-log.md`.
7. Decide one of:
   - `proceed`
   - `hold_for_review`
   - `stop_and_replan`
8. Publish only after manual approval when the publish gate says `hold_for_review` or the operating decision is not `proceed`.

## Manual Review Checklist

- No unsupported claims were introduced by copy or merchandising changes
- Contact, help, and policy pages remain honest and actionable
- Product and collection routes still justify indexing
- Homepage and PDP modules still point users into relevant next steps
- Draft products are not leaking into live routes or checkout

## Rollback Rule

- If the build is technically valid but trust, indexing, or page quality regresses, hold or roll back the publish and remediate before the next run.
