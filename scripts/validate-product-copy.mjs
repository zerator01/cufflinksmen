import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';

const rootDir = path.resolve(import.meta.dirname, '..');
const productsDir = path.join(rootDir, 'src', 'content', 'products');
const siteConfigFile = path.join(rootDir, 'site.config.yaml');

const bannedProductPatterns = [
  { pattern: /\bhypoallergenic\b/i, reason: 'Use descriptive material language instead of unsupported skin-safety claims.' },
  { pattern: /\bguarantee(d|s)?\b/i, reason: 'Avoid guarantees in product copy unless backed by a formal policy.' },
  { pattern: /\bproprietary\b/i, reason: 'Do not imply proprietary engineering without source evidence.' },
  { pattern: /\bweightless\b/i, reason: 'Avoid absolute comfort claims in product copy.' },
  { pattern: /\bnickel[- ]?free\b/i, reason: 'Do not claim nickel-free status without verified material evidence.' },
  { pattern: /\babsolute zero nickel\b/i, reason: 'Do not make absolute material exposure claims.' },
  { pattern: /\btarnish-resistant\b/i, reason: 'Avoid durability claims unless explicitly supported by source evidence.' },
  { pattern: /\bsilk thread\b/i, reason: 'Do not infer construction details not present in source data.' },
  { pattern: /\b12-hour\b/i, reason: 'Avoid time-bound wear guarantees in product copy.' },
  { pattern: /\bstone loss is extremely rare\b/i, reason: 'Do not make reliability-rate claims without evidence.' },
];

const bannedSitePatterns = [
  { pattern: /\bchecked for\b/i, reason: 'Do not imply internal QA verification without a documented process.' },
  { pattern: /\bmatched the bulk order exactly\b/i, reason: 'Do not publish exact consistency claims without fulfillment evidence.' },
  { pattern: /\bghosted me\b/i, reason: 'Avoid fabricated sourcing anecdotes in testimonials.' },
  { pattern: /\bnever over-promised\b/i, reason: 'Avoid absolute business conduct claims in testimonials.' },
];

function parseFrontmatter(fileContent) {
  const match = fileContent.match(/^---\n([\s\S]*?)\n---/);
  if (!match) {
    throw new Error('Missing frontmatter');
  }

  return {
    frontmatter: yaml.load(match[1]),
    body: fileContent.slice(match[0].length).trim(),
  };
}

function checkPatterns(text, patterns, fileName, failures) {
  for (const { pattern, reason } of patterns) {
    if (pattern.test(text)) {
      failures.push(`${fileName}: ${reason} Pattern: ${pattern}`);
    }
  }
}

function validateProducts() {
  const files = fs.readdirSync(productsDir).filter((fileName) => fileName.endsWith('.md'));
  const failures = [];

  for (const fileName of files) {
    const fullPath = path.join(productsDir, fileName);
    const fileContent = fs.readFileSync(fullPath, 'utf8');
    const { frontmatter, body } = parseFrontmatter(fileContent);
    const status = String(frontmatter.status || 'published');

    if (status === 'draft') {
      continue;
    }

    const combinedText = [
      frontmatter.description || '',
      ...(frontmatter.features || []),
      ...(frontmatter.faq || []).flatMap((item) => [item.q, item.a]),
      ...(frontmatter.specs ? Object.entries(frontmatter.specs).flatMap(([key, value]) => [key, value]) : []),
      frontmatter.use_case || '',
      body,
    ].join('\n');

    checkPatterns(combinedText, bannedProductPatterns, fileName, failures);
  }

  return failures;
}

function validateSiteConfig() {
  const siteConfig = fs.readFileSync(siteConfigFile, 'utf8');
  const failures = [];
  checkPatterns(siteConfig, bannedSitePatterns, 'site.config.yaml', failures);
  return failures;
}

const failures = [...validateProducts(), ...validateSiteConfig()];

if (failures.length > 0) {
  console.error('Copy validation failed:\n');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log('Copy validation passed.');
