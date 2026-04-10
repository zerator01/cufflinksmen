import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';

const rootDir = path.resolve(import.meta.dirname, '..');
const productsDir = path.join(rootDir, 'src', 'content', 'products');
const outputFile = path.join(rootDir, 'functions', '_shared', 'productCatalog.js');

function parseFrontmatter(fileContent) {
  const match = fileContent.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;

  return yaml.load(match[1]);
}

function buildCatalog() {
  const fileNames = fs.readdirSync(productsDir).filter((fileName) => fileName.endsWith('.md'));
  const catalog = {};

  for (const fileName of fileNames) {
    const productId = fileName.replace(/\.md$/, '');
    const fullPath = path.join(productsDir, fileName);
    const fileContent = fs.readFileSync(fullPath, 'utf8');
    const frontmatter = parseFrontmatter(fileContent);

    if (!frontmatter || typeof frontmatter !== 'object') {
      throw new Error(`Missing or invalid frontmatter in ${fileName}`);
    }

    const name = String(frontmatter.name || '').trim();
    const price = Number(frontmatter.price);
    const image = String(frontmatter.image || '').trim();
    const status = String(frontmatter.status || 'published').trim();

    if (status === 'draft') {
      continue;
    }

    if (!name) {
      throw new Error(`Missing product name in ${fileName}`);
    }

    if (!Number.isFinite(price)) {
      throw new Error(`Invalid product price in ${fileName}`);
    }

    catalog[productId] = {
      name,
      price,
      image,
    };
  }

  return catalog;
}

const catalog = buildCatalog();

const output = `// Auto-generated from src/content/products/*.md\nexport const productCatalog = ${JSON.stringify(catalog, null, 2)};\n`;

fs.mkdirSync(path.dirname(outputFile), { recursive: true });
fs.writeFileSync(outputFile, output, 'utf8');

console.log(`Generated product catalog with ${Object.keys(catalog).length} products.`);
