# Operations Automation Backlog

Use this document to separate safe automation candidates from tasks that still require human judgement for the storefront.

## Automate First

- Weekly ops summary and plan drafts
- QA sampling queue generation
- Publish-gate summaries
- Broken trust-page checks
- Draft leakage checks

## Human Review Required

- Product and material claim decisions
- Support, returns, and policy wording changes
- Index or noindex decisions for borderline routes
- Category architecture and merchandising narrative changes

## Candidate Systems

- Repo-local scripts in `scripts/`
- GitHub Actions for verification and scheduled checks
- External orchestrators such as OpenClaw for notifications or multi-step review routing

## Backlog Table

| Task | Manual Cost | Risk If Automated Wrong | Suggested System | Status |
| --- | --- | --- | --- | --- |
| Draft QA sample queue | Low | Low | Repo script | Done |
| Draft publish-gate summary | Low | Low | Repo script | Done |
| Check trust-page contact details | Medium | Medium | Repo script | Proposed |
| Verify checkout catalog versus published SKUs | Medium | Medium | Repo script | Proposed |
| Approve production deploy | Low | High | Human gate only | Keep Manual |

## Rule

- Do not automate judgment-heavy merchandising or trust decisions until the SOP path is stable for multiple runs.
