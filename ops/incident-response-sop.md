# Incident Response SOP

Use this SOP when the storefront has a trust, checkout, indexing, or publish-quality incident.

## Incident Types

- Broken checkout protections or price mismatches
- Broken routing, sitemap, or robots output
- Broken contact or support paths
- Product-copy or policy-copy changes that create unsupported claims
- Draft or hidden content leaking into live pages or checkout

## First Response

1. Stop public deployment for the affected cycle.
2. Record the incident start time, trigger, and suspected blast radius.
3. Preserve the failing diff, build output, or screenshots.
4. Decide whether the safest path is rollback, hotfix, or manual hold.

## Triage Questions

- Is the issue confined to one route family, one product batch, or the whole storefront?
- Did copy validation or the publish gate catch it, or did it slip past current checks?
- Does the issue require code, content, or configuration correction?

## Recovery

- Roll back to the last known good publish if public quality is affected
- Patch copy, route logic, catalog generation, or support details
- Re-run `npm run validate:copy`, `npm run validate:ops`, and `npm run build`
- Log what changed in `ops/ops-execution-log.md`

## Follow-Up

- Update the relevant SOP if the incident exposed a missing control
- Add stable tasks to `ops/automation-backlog.md` if the response was too manual
