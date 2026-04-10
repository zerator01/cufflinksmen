# 2C Boutique Scaffold V2

This scaffold is the current default Astro storefront base for the cluster.

It is derived from the hardened `bridaljewelleryset` implementation and already includes:

- server-side checkout pricing
- markdown-derived checkout catalog
- `draft` SKU support
- prebuild copy validation
- transactional `noindex` and sitemap hygiene
- homepage curated picks
- PDP related products
- honest `mailto:` fallbacks instead of fake form submissions
- a lightweight ops scaffold for weekly planning, QA sampling, and publish-gate review
- a default image layer for site visuals and product-image ingestion

## What This Scaffold Is For

Use this scaffold when creating a new storefront that follows the current cluster shape:

- Astro site
- products stored in `src/content/products/*.md`
- checkout handled by a server function
- site copy and navigation configured through `site.config.yaml`

Do not treat this scaffold as a flagship-brand starter.
It is a safe cluster base, not a maximal marketing stack.

## Required Replacements Before Launch

You must replace these placeholder values before deploying a real store:

- `site.config.yaml`
  - brand name
  - domain
  - emails
  - category names and descriptions
  - hero copy
  - testimonials
  - FAQ
- `src/content/products/_example_product.md`
  - remove or replace with real products
- `content/templates/product-template.example.md`
  - keep as a reference only, do not publish it as a live SKU

## Core Files

### Content and validation

- `src/content.config.ts`
  - product schema
  - includes `status: "published" | "draft"`
- `scripts/generate-product-catalog.mjs`
  - generates `functions/_shared/productCatalog.js`
- `scripts/validate-product-copy.mjs`
  - blocks high-risk unsupported claims at build time

### Checkout

- `functions/api/checkout.js`
  - resolves canonical price from server-side catalog
  - does not trust browser price

### Growth modules

- `src/lib/productSignals.ts`
  - lightweight signals used for:
    - homepage curated picks
    - PDP related products

### Ops scaffold

- `OPERATING_PLAN.md`
- `CONTENT_CALENDAR.md`
- `FUNNEL_MAP.md`
- `KPI_SCORECARD.md`
- `EXPERIMENT_LOG.md`
- `OPERATIONS_REPORT.md`
- `NEXT_STAGE_PLAN.md`
- `ops/operating-model.md`
- `ops/quality-review-sop.md`
- `ops/publishing-sop.md`
- `ops/incident-response-sop.md`
- `ops/automation-backlog.md`
- `ops/ops-execution-log.md`
- `ops/generated/`

### Image pipeline

- `IMAGE_PIPELINE.md`
- `generate_images.sh`
- `scripts/generate-site-image-manifest.mjs`
- `scripts/check-image-placeholders.mjs`
- `scripts/render-site-images.mjs`
- `scripts/upload-site-images-to-r2.py`

## Local Commands

From the scaffold directory:

```bash
npm ci
npm run validate:data
npm run images:manifest
npm run images:upload
npm run validate:copy
npm run validate:ops
npm run build
npm run ops:cycle
```

Behavior:

- `prebuild` regenerates the checkout catalog
- `prebuild` also runs copy validation
- build fails if unsupported copy patterns are present
- `validate:ops` generates a publish recommendation from storefront governance checks
- `ops:cycle` generates a weekly ops summary, plan, review, replan, QA queue, and publish gate
- `images:manifest` generates a site-image manifest from `site.config.yaml`
- `images:check` fails if placeholder image references are still present
- `images:render` renders site images into `public/images/`
- `images:upload` uploads rendered site images to the site R2 bucket
- `validate:data` checks `extracted_products.json` before product markdown generation

## Product Workflow

### Live product

Use `status: "published"` for products that should:

- generate static product pages
- appear in collections and product lists
- appear in the checkout catalog

### Draft product

Use `status: "draft"` for products that should not go live yet.

Draft products are excluded from:

- product listing pages
- collection pages
- static product route generation
- generated checkout catalog
- sitemap

## New Site Workflow

Recommended order:

1. Copy scaffold into the new site directory.
2. Replace core values in `site.config.yaml`.
3. Remove `_example_product.md` once real products exist.
4. Write or generate real product markdown into `src/content/products/`.
5. Prepare site images:

```bash
npm run images:manifest
```

6. Run:

```bash
npm ci
npm run validate:copy
npm run build
```

6. Fix any validation issues before deployment.

## Automation Notes

### Phase 2

`phase2_scaffold.py` already points at this scaffold.

It now removes legacy placeholder files such as:

- `TEMPLATE.example`
- `_example_product.md`

### Phase 5

`phase5_ecommerce_copy.py` has been updated to write markdown into:

- `src/content/products/*.md`

and to emit frontmatter closer to this scaffold's schema.

### Phase 6

`phase6_astro_deploy.py` still contains older AI-merge assumptions that expect generated content under:

- `content/products/`

This means the deploy script is not yet fully re-verified against the new scaffold end-to-end.

Current recommendation:

- use this scaffold now for local generation and build
- use this scaffold now for local generation, image prep, and build
- run one real new-site validation before assuming Phase 6 is fully aligned

## Known Limits

- copy validation intentionally uses a narrow denylist, not a full truth engine
- related products are heuristic, not ML-driven
- curated picks are lightweight and based on inferred signals
- wholesale is intentionally honest but not a full B2B system
- ops scaffold is intentionally lightweight and focused on publish governance, not a full BI or CRM stack
- site-image rendering assumes the external renderer exists locally and is configured outside the scaffold
- ops discipline borrows two sources:
  - `pseo`: publish governance, QA sampling, and incident handling
  - `emaillist`: cadence discipline, owner/executor split, and anti-drift rules

## Cluster Positioning

This scaffold should be treated as:

- Tier 1 cluster-safe base
- plus two lightweight growth modules:
  - curated picks
  - related products
- plus a lightweight Tier 2 ops scaffold:
  - operating plan
  - KPI scorecard
  - experiment log
  - operations report
  - next-stage plan
  - weekly ops cycle
  - QA sampling queue
  - publish gate

Heavy systems such as UGC, deep editorial hubs, advanced CRM, or rich review platforms should remain optional and site-specific.
