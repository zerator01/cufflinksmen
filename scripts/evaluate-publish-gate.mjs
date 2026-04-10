import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const PRODUCTS_DIR = path.join(ROOT, 'src', 'content', 'products');
const PRODUCT_CATALOG_PATH = path.join(ROOT, 'functions', '_shared', 'productCatalog.js');
const JSON_OUTPUT_PATH = path.join(ROOT, 'ops', 'generated', 'publish-gate.json');
const MARKDOWN_OUTPUT_PATH = path.join(ROOT, 'ops', 'generated', 'publish-gate.md');

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function readFileSafe(filePath) {
  return fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : '';
}

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};
  const frontmatter = {};

  for (const rawLine of match[1].split('\n')) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const separatorIndex = line.indexOf(':');
    if (separatorIndex === -1) continue;
    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1).trim().replace(/^['"]|['"]$/g, '');
    frontmatter[key] = value;
  }

  return frontmatter;
}

function listProducts() {
  if (!fs.existsSync(PRODUCTS_DIR)) return [];

  return fs
    .readdirSync(PRODUCTS_DIR)
    .filter((file) => file.endsWith('.md'))
    .map((file) => {
      const fullPath = path.join(PRODUCTS_DIR, file);
      const frontmatter = parseFrontmatter(readFileSafe(fullPath));
      return {
        slug: file.replace(/\.md$/, ''),
        status: frontmatter.status || 'published',
        hasCategory: Boolean(frontmatter.category),
        hasPrice: Boolean(frontmatter.price),
        hasDescription: Boolean(frontmatter.description),
      };
    });
}

const products = listProducts();
const publishedProducts = products.filter((product) => product.status !== 'draft');
const missingFields = publishedProducts.filter(
  (product) => !product.hasCategory || !product.hasPrice || !product.hasDescription,
);
const missingTrustPages = ['contact.astro', 'help.astro', 'privacy.astro', 'terms.astro'].filter(
  (file) => !fs.existsSync(path.join(ROOT, 'src', 'pages', file)),
);
const catalogExists = fs.existsSync(PRODUCT_CATALOG_PATH);
const findings = [];

if (publishedProducts.length === 0) findings.push('No published products found.');
if (missingFields.length > 0) findings.push(`${missingFields.length} published products are missing core frontmatter.`);
if (missingTrustPages.length > 0) findings.push(`Missing trust pages: ${missingTrustPages.join(', ')}.`);
if (!catalogExists) findings.push('Generated checkout catalog is missing.');

const status = findings.length === 0 ? 'ready_to_publish' : 'hold_for_review';
const payload = {
  generated_at: new Date().toISOString(),
  site: path.basename(ROOT),
  status,
  finding_count: findings.length,
  findings,
  published_product_count: publishedProducts.length,
};

const markdown = `# Publish Gate

- Generated at: ${payload.generated_at}
- Site: \`${payload.site}\`
- Status: \`${payload.status}\`
- Published product count: ${payload.published_product_count}
- Finding count: ${payload.finding_count}

## Findings

${findings.length > 0 ? findings.map((finding) => `- ${finding}`).join('\n') : '- No blocking findings. Representative page review can proceed.'}

## Gate Guidance

- \`ready_to_publish\` means automated checks found no obvious blockers.
- \`hold_for_review\` means a human should resolve findings before deployment.
- This gate is not a replacement for representative page review.
`;

ensureDir(JSON_OUTPUT_PATH);
fs.writeFileSync(JSON_OUTPUT_PATH, `${JSON.stringify(payload, null, 2)}\n`);
fs.writeFileSync(MARKDOWN_OUTPUT_PATH, `${markdown}\n`);
console.log(`Wrote ${path.relative(ROOT, MARKDOWN_OUTPUT_PATH)}.`);
