import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';

const ROOT = process.cwd();
const MANIFEST_PATH = path.join(ROOT, 'content', 'site-image-manifest.json');
const CONFIG_PATH = path.join(ROOT, 'site.config.yaml');
const SRC_DIR = path.join(ROOT, 'src');
const COPY_PATH = path.join(ROOT, 'content', 'final_website_copy.md');
const SITE_DIR = path.basename(ROOT);
const ASSET_DOMAIN = `https://assets.${SITE_DIR}.com`;

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else files.push(full);
  }
  return files;
}

function collectStrings(value, acc = []) {
  if (typeof value === 'string') acc.push(value);
  else if (Array.isArray(value)) value.forEach((item) => collectStrings(item, acc));
  else if (value && typeof value === 'object') Object.values(value).forEach((item) => collectStrings(item, acc));
  return acc;
}

if (!fs.existsSync(MANIFEST_PATH)) {
  console.error('Missing content/site-image-manifest.json');
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
const slots = Array.isArray(manifest.slots) ? manifest.slots : [];
const allowedPublicPaths = new Set(slots.map((slot) => slot.public_path).filter(Boolean));
const allowedRemoteUrls = new Set([...allowedPublicPaths].map((publicPath) => `${ASSET_DOMAIN}${publicPath}`));

const failures = [];

const config = yaml.load(fs.readFileSync(CONFIG_PATH, 'utf8'));
for (const ref of collectStrings(config)) {
  if (!/\.(png|webp|jpg|jpeg|svg)$/i.test(ref)) continue;
  if (ref.includes('placeholder')) failures.push(`Placeholder image still referenced in site config: ${ref}`);
  if (ref.startsWith('/images/') && !allowedPublicPaths.has(ref)) failures.push(`Unmanifested local image in site config: ${ref}`);
  if (/^https?:\/\//.test(ref) && ref.includes('/images/') && !allowedRemoteUrls.has(ref)) failures.push(`Image URL in site config is outside current manifest: ${ref}`);
}

const textFiles = walk(SRC_DIR)
  .filter((file) => !file.includes(`${path.sep}src${path.sep}content${path.sep}products${path.sep}`))
  .concat(fs.existsSync(COPY_PATH) ? [COPY_PATH] : []);
for (const file of textFiles) {
  const text = fs.readFileSync(file, 'utf8');
  const refs = text.match(/https?:\/\/[^\s"'`)>]+|\/images\/[^\s"'`)>]+/g) || [];
  for (const ref of refs) {
    if (!/\.(png|webp|jpg|jpeg)$/i.test(ref)) continue;
    if (ref.includes('placeholder')) failures.push(`${path.relative(ROOT, file)} uses placeholder image: ${ref}`);
    if (ref.startsWith('/images/') && !allowedPublicPaths.has(ref)) failures.push(`${path.relative(ROOT, file)} uses unmanifested local image: ${ref}`);
    if (ref.startsWith('https://assets.') && !allowedRemoteUrls.has(ref)) failures.push(`${path.relative(ROOT, file)} uses remote image outside current manifest: ${ref}`);
  }
}

if (failures.length) {
  console.error(`Image audit failed with ${failures.length} issue(s):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Image audit passed.');
