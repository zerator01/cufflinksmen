import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const MANIFEST_PATH = path.join(ROOT, 'content', 'site-image-manifest.json');
const IMAGES_DIR = path.join(ROOT, 'public', 'images');

if (!fs.existsSync(MANIFEST_PATH)) {
  console.error('Missing content/site-image-manifest.json');
  process.exit(1);
}

if (!fs.existsSync(IMAGES_DIR)) {
  console.error('Missing public/images directory');
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
const slots = Array.isArray(manifest.slots) ? manifest.slots : [];
const allowed = new Set(['.gitkeep']);

for (const slot of slots) {
  const output = typeof slot.output === 'string' ? slot.output : '';
  const base = path.basename(output);
  if (!base) continue;
  allowed.add(`${base}.png`);
  allowed.add(`${base}.webp`);
}

const files = fs.readdirSync(IMAGES_DIR);
const removed = [];

for (const file of files) {
  if (allowed.has(file)) continue;
  const fullPath = path.join(IMAGES_DIR, file);
  if (!fs.statSync(fullPath).isFile()) continue;
  fs.unlinkSync(fullPath);
  removed.push(file);
}

console.log(`Pruned ${removed.length} files from public/images.`);
for (const file of removed) {
  console.log(`- ${file}`);
}
