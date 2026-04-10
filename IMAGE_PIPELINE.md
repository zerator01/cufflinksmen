# Image Pipeline

This scaffold includes a default image layer for both site-level visuals and product-image processing.

## Scope

There are two separate image concerns:

1. `site images`
   - homepage hero
   - category visuals
   - feature visuals
   - avatar/testimonial support images
   - default OG image
   - popup image when enabled

2. `product images`
   - source images inside `extracted_products.json`
   - conversion to stable asset URLs
   - later markdown generation from updated product data

Do not treat these as the same pipeline.

## Site Image Flow

Use these commands inside the site directory:

```bash
npm run images:manifest
npm run images:check
npm run images:render
npm run images:upload
```

What they do:

- `images:manifest`
  - reads `site.config.yaml`
  - generates `content/site-image-manifest.json`
  - generates `content/site-image-manifest.md`
- `images:check`
  - reports any remaining placeholder references
- `images:render`
  - reads the manifest
  - renders images into `public/images/`
  - expects the external renderer to be available locally
- `images:upload`
  - uploads `public/images/*.{webp,png}` to the site R2 bucket
  - writes `content/site-image-upload-manifest.json`
  - assumes bucket name `${site_dir}-assets`
  - assumes public domain `https://assets.<brand.domain>`

Convenience entrypoint:

```bash
./generate_images.sh
```

Upload remains a separate step because rendering may be retried multiple times before the final asset set is stable.

## Product Image Flow

Use the repo-level script:

- [phase5b_image_pipeline.py](/Users/zerator/Desktop/antigravity-work/2C电商项目/phase5b_image_pipeline.py)

This path:

- reads `extracted_products.json`
- uploads processed product images to the site asset bucket
- rewrites image URLs in `extracted_products.json`

After product images are normalized, run the product markdown generation step.

## Renderer Assumption

Default renderer path:

- `/Users/zerator/.gemini/antigravity/skills/canvas-design/scripts/external_renderer.py`

Override with:

```bash
export RENDERER_PATH="/custom/path/to/external_renderer.py"
```

## Important Rule

- Site images are part of scaffold setup.
- Product images are part of merchandising ingestion.
- Do not launch a real store with placeholder site images.
