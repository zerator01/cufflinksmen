import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';

const ROOT = process.cwd();
const CONFIG_PATH = path.join(ROOT, 'site.config.yaml');
const JSON_OUTPUT_PATH = path.join(ROOT, 'content', 'site-image-manifest.json');
const MARKDOWN_OUTPUT_PATH = path.join(ROOT, 'content', 'site-image-manifest.md');

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function loadConfig() {
  return yaml.load(fs.readFileSync(CONFIG_PATH, 'utf8'));
}

function makePrompt({ subject, mood, composition, exclusions = 'No text, no watermark, no brand marks.' }) {
  return `${subject}. ${mood}. ${composition}. Photorealistic editorial product photography, high-end ecommerce clarity, clean lighting. ${exclusions}`;
}

const config = loadConfig();
const brandName = config.brand?.name || path.basename(ROOT);
const heroHeadline = config.hero?.headline || brandName;
const heroSubheadline = config.hero?.subheadline || '';
const categories = Array.isArray(config.categories) ? config.categories : [];
const features = Array.isArray(config.features) ? config.features : [];
const testimonials = Array.isArray(config.testimonials) ? config.testimonials : [];

const slots = [];

slots.push({
  slot_name: 'hero_background',
  width: 2560,
  height: 1200,
  output: 'public/images/hero-bg',
  public_path: '/images/hero-bg.webp',
  prompt: makePrompt({
    subject: `${brandName} homepage hero background for ${heroHeadline}`,
    mood: `Mood: event-night polish, photo-ready sparkle, accessible elegance. Context: ${heroSubheadline}`,
    composition: 'Ultra-wide landscape with negative space for homepage copy and layered sparkle details',
  }),
});

slots.push({
  slot_name: 'about_hero',
  width: 800,
  height: 500,
  output: 'public/images/about-hero',
  public_path: '/images/about-hero.webp',
  prompt: makePrompt({
    subject: `${brandName} about page curation image`,
    mood: `Mood: trustworthy, editorial, behind-the-scenes clarity for ${brandName}`,
    composition: 'Landscape storytelling image suitable for about page content block',
  }),
});

slots.push({
  slot_name: 'about_why',
  width: 800,
  height: 500,
  output: 'public/images/about-why',
  public_path: '/images/about-why.webp',
  prompt: makePrompt({
    subject: `${brandName} quality and selection image`,
    mood: 'Mood: careful review, polished merchandising, honest trust signal',
    composition: 'Landscape detail image for supporting why-us content',
  }),
});

slots.push({
  slot_name: 'contact_hero',
  width: 1200,
  height: 800,
  output: 'public/images/contact-hero',
  public_path: '/images/contact-hero.png',
  prompt: makePrompt({
    subject: `${brandName} contact page support image`,
    mood: 'Mood: approachable support, premium but clear ecommerce service energy',
    composition: 'Split-hero friendly landscape image with room for adjacent contact copy',
  }),
});

categories.slice(0, 3).forEach((category, index) => {
  const slug = category.slug || slugify(category.name || `category-${index + 1}`);
  slots.push({
    slot_name: `category_${slug}`,
    width: 800,
    height: 460,
    output: `public/images/category-${slug}`,
    public_path: `/images/category-${slug}.webp`,
    prompt: makePrompt({
      subject: `${brandName} category image for ${category.name}`,
      mood: `Mood: niche-specific merchandising image. Context: ${category.description || category.name}`,
      composition: 'Landscape crop suitable for category cards, product-led, visually clean, easy focal point',
    }),
  });
});

features.slice(0, 3).forEach((feature, index) => {
  const slug = slugify(feature.subtitle || feature.headline || `feature-${index + 1}`) || `feature-${index + 1}`;
  slots.push({
    slot_name: `feature_${slug}`,
    width: 800,
    height: 500,
    output: `public/images/feature-${index + 1}`,
    public_path: `/images/feature-${index + 1}.webp`,
    prompt: makePrompt({
      subject: `${brandName} feature image for ${feature.headline || feature.subtitle}`,
      mood: `Mood: conversion-supporting supporting image. Context: ${feature.description || ''}`,
      composition: 'Editorial ecommerce supporting visual, medium crop, focused subject, clean background',
    }),
  });
});

slots.push({
  slot_name: 'og_default',
  width: 1200,
  height: 630,
  output: 'public/images/og-default',
  public_path: '/images/og-default.webp',
  prompt: makePrompt({
    subject: `${brandName} open graph image`,
    mood: `Mood: strong first-impression social preview for ${brandName}`,
    composition: 'Wide social card composition with strong center balance and readable negative space',
  }),
});

testimonials.slice(0, 3).forEach((testimonial, index) => {
  const slug = slugify(testimonial.name || testimonial.role || `avatar-${index + 1}`) || `avatar-${index + 1}`;
  slots.push({
    slot_name: `avatar_${slug}`,
    width: 640,
    height: 640,
    output: `public/images/avatar-${index + 1}`,
    public_path: `/images/avatar-${index + 1}.webp`,
    prompt: makePrompt({
      subject: `${brandName} testimonial support portrait for ${testimonial.role || testimonial.name || 'customer'}`,
      mood: `Mood: believable, polished, warm, non-stock-photo energy. Context: ${testimonial.text || ''}`,
      composition: 'Square portrait crop, clean background, subtle depth of field',
      exclusions: 'No text, no watermark, no brand marks, no uncanny symmetry.',
    }),
  });
});

slots.push({
  slot_name: 'popup_guide',
  width: 800,
  height: 800,
  output: 'public/images/popup-guide',
  public_path: '/images/popup-guide.webp',
  prompt: makePrompt({
    subject: `${brandName} popup guide image`,
    mood: `Mood: helpful and low-pressure lead magnet support. Context: ${config.exit_popup?.description || ''}`,
    composition: 'Square ecommerce promo visual with a single clear focal point',
  }),
});

const payload = {
  generated_at: new Date().toISOString(),
  site: path.basename(ROOT),
  brand: brandName,
  slot_count: slots.length,
  slots,
};

const markdown = `# Site Image Manifest

- Generated at: ${payload.generated_at}
- Site: \`${payload.site}\`
- Brand: \`${payload.brand}\`
- Slot count: ${payload.slot_count}

## Slots

| Slot | Size | Output | Public Path |
| --- | --- | --- | --- |
${slots.map((slot) => `| \`${slot.slot_name}\` | ${slot.width}x${slot.height} | \`${slot.output}\` | \`${slot.public_path}\` |`).join('\n')}

## Notes

- Prompts are generated from \`site.config.yaml\`.
- Regenerate the manifest after major category, feature, or brand-copy changes.
- Product images are handled separately from this site-image manifest.
`;

ensureDir(JSON_OUTPUT_PATH);
fs.writeFileSync(JSON_OUTPUT_PATH, `${JSON.stringify(payload, null, 2)}\n`);
fs.writeFileSync(MARKDOWN_OUTPUT_PATH, `${markdown}\n`);
console.log(`Wrote ${path.relative(ROOT, MARKDOWN_OUTPUT_PATH)}.`);
