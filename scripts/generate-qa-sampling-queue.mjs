import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const PRODUCTS_DIR = path.join(ROOT, 'src', 'content', 'products');
const SITE_CONFIG_PATH = path.join(ROOT, 'site.config.yaml');
const JSON_OUTPUT_PATH = path.join(ROOT, 'ops', 'generated', 'qa-sampling-queue.json');
const MARKDOWN_OUTPUT_PATH = path.join(ROOT, 'ops', 'generated', 'qa-sampling-queue.md');

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

function listPublishedProducts() {
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
        category: frontmatter.category || 'Uncategorized',
        price: Number(frontmatter.price || 0),
        name: frontmatter.name || file.replace(/\.md$/, ''),
      };
    })
    .filter((product) => product.status !== 'draft')
    .sort((a, b) => a.price - b.price);
}

const products = listPublishedProducts();
const lowPrice = products[0] || null;
const highPrice = products.at(-1) || null;
const middlePrice = products.length > 0 ? products[Math.floor(products.length / 2)] : null;
const categories = [...new Set(products.map((product) => product.category))];
const sampleMap = new Map();

function addSample(route, reason) {
  if (!route || sampleMap.has(route)) return;
  sampleMap.set(route, { route, reason });
}

addSample('/', 'Homepage trust and merchandising baseline');
addSample('/products/', 'Collection and product discovery baseline');
addSample('/contact/', 'Support path validity and honesty check');
addSample('/help/', 'Trust and policy guidance check');
if (lowPrice) addSample(`/products/${lowPrice.slug}/`, 'Lowest-priced live PDP sample');
if (middlePrice) addSample(`/products/${middlePrice.slug}/`, 'Median live PDP sample');
if (highPrice) addSample(`/products/${highPrice.slug}/`, 'Highest-priced live PDP sample');
if (categories[0]) addSample('/collections/', `Review category logic including ${categories[0]}`);

const payload = {
  generated_at: new Date().toISOString(),
  site: path.basename(ROOT),
  samples: [...sampleMap.values()],
  product_count: products.length,
  category_count: categories.length,
  config_present: fs.existsSync(SITE_CONFIG_PATH),
};

const markdown = `# QA Sampling Queue

- Generated at: ${payload.generated_at}
- Site: \`${payload.site}\`
- Published product count: ${payload.product_count}
- Category count: ${payload.category_count}
- Site config present: ${payload.config_present ? 'yes' : 'no'}

## Sample Queue

${payload.samples.map((sample) => `- \`${sample.route}\` ${sample.reason}`).join('\n')}

## Review Reminder

- Confirm trust pages are honest and actionable.
- Confirm representative PDPs do not exceed source evidence.
- Confirm collection and homepage modules still point users toward valid next steps.
`;

ensureDir(JSON_OUTPUT_PATH);
fs.writeFileSync(JSON_OUTPUT_PATH, `${JSON.stringify(payload, null, 2)}\n`);
fs.writeFileSync(MARKDOWN_OUTPUT_PATH, `${markdown}\n`);
console.log(`Wrote ${path.relative(ROOT, MARKDOWN_OUTPUT_PATH)}.`);
