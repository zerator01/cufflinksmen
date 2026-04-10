import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';

const ROOT = process.cwd();
const DATA_PATH = path.join(ROOT, 'extracted_products.json');
const CONFIG_PATH = path.join(ROOT, 'site.config.yaml');

function fail(message) {
  console.error(message);
  process.exit(1);
}

function loadJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function loadYaml(filePath) {
  return yaml.load(fs.readFileSync(filePath, 'utf8'));
}

if (!fs.existsSync(DATA_PATH)) {
  fail('Missing extracted_products.json.');
}

if (!fs.existsSync(CONFIG_PATH)) {
  fail('Missing site.config.yaml.');
}

const products = loadJson(DATA_PATH);
const config = loadYaml(CONFIG_PATH);
const validCategories = new Set((config.categories || []).map((category) => category.name));

if (!Array.isArray(products)) {
  fail('extracted_products.json must be a JSON array.');
}

if (products.length === 0) {
  console.log('extracted_products.json is present and currently empty.');
  process.exit(0);
}

const errors = [];
const seenSlugs = new Set();

for (const [index, product] of products.entries()) {
  const prefix = `product[${index}]`;
  const slug = product?.slug;
  const name = product?.name;
  const price = product?.price ?? product?.regular_price;
  const images = product?.images;
  const categories = product?.categories;

  if (!name || typeof name !== 'string') {
    errors.push(`${prefix}: missing valid "name".`);
  }

  if (!slug || typeof slug !== 'string') {
    errors.push(`${prefix}: missing valid "slug".`);
  } else if (seenSlugs.has(slug)) {
    errors.push(`${prefix}: duplicate slug "${slug}".`);
  } else {
    seenSlugs.add(slug);
  }

  const parsedPrice = Number(String(price ?? '').replace('$', '').replace(',', '').trim());
  if (price === undefined || price === null || Number.isNaN(parsedPrice)) {
    errors.push(`${prefix}: missing or invalid "price" / "regular_price".`);
  }

  if (!Array.isArray(images) || images.length === 0) {
    errors.push(`${prefix}: missing "images" array.`);
  } else if (!images[0] || typeof images[0].src !== 'string' || !images[0].src.trim()) {
    errors.push(`${prefix}: first image is missing a valid "src".`);
  }

  if (!Array.isArray(categories) || categories.length === 0) {
    errors.push(`${prefix}: missing "categories" array.`);
  } else {
    const firstCategory = categories[0]?.name;
    if (!firstCategory || typeof firstCategory !== 'string') {
      errors.push(`${prefix}: first category missing valid "name".`);
    } else if (!validCategories.has(firstCategory)) {
      errors.push(`${prefix}: category "${firstCategory}" does not match site.config.yaml categories.`);
    }
  }

  if (product.attributes !== undefined) {
    if (!Array.isArray(product.attributes)) {
      errors.push(`${prefix}: "attributes" must be an array when present.`);
    } else {
      for (const [attrIndex, attr] of product.attributes.entries()) {
        if (!attr || typeof attr.name !== 'string' || !Array.isArray(attr.options)) {
          errors.push(`${prefix}: attributes[${attrIndex}] must include string "name" and array "options".`);
        }
      }
    }
  }

  if (product.variations_data !== undefined) {
    if (!Array.isArray(product.variations_data)) {
      errors.push(`${prefix}: "variations_data" must be an array when present.`);
    } else {
      for (const [variantIndex, variant] of product.variations_data.entries()) {
        if (!variant || typeof variant !== 'object') {
          errors.push(`${prefix}: variations_data[${variantIndex}] must be an object.`);
          continue;
        }
        if (!variant.slug || typeof variant.slug !== 'string') {
          errors.push(`${prefix}: variations_data[${variantIndex}] missing valid "slug".`);
        }
        const variantPrice = Number(String(variant.price ?? '').replace('$', '').replace(',', '').trim());
        if (variant.price !== undefined && Number.isNaN(variantPrice)) {
          errors.push(`${prefix}: variations_data[${variantIndex}] has invalid "price".`);
        }
      }
    }
  }
}

if (errors.length > 0) {
  console.error('Extracted product validation failed:');
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log(`Validated ${products.length} extracted products successfully.`);
