import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const ROOT = process.cwd();
const MANIFEST_PATH = path.join(ROOT, 'content', 'site-image-manifest.json');
const DEFAULT_RENDERER = '/Users/zerator/.gemini/antigravity/skills/canvas-design/scripts/external_renderer.py';
const rendererPath = process.env.RENDERER_PATH || DEFAULT_RENDERER;
const MAX_RETRIES = Number(process.env.IMAGE_RENDER_RETRIES || 3);

if (!fs.existsSync(MANIFEST_PATH)) {
  console.error('Missing content/site-image-manifest.json. Run `npm run images:manifest` first.');
  process.exit(1);
}

if (!fs.existsSync(rendererPath)) {
  console.error(`Renderer not found at ${rendererPath}. Set RENDERER_PATH if needed.`);
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));

for (const slot of manifest.slots || []) {
  const outputBase = path.join(ROOT, slot.output);
  const expectedWebp = `${outputBase}.webp`;
  fs.mkdirSync(path.dirname(outputBase), { recursive: true });

  if (fs.existsSync(expectedWebp)) {
    console.log(`Skipping ${slot.slot_name}; existing file found at ${path.relative(ROOT, expectedWebp)}.`);
    continue;
  }

  let success = false;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt += 1) {
    console.log(`Rendering ${slot.slot_name} -> ${slot.output} (attempt ${attempt}/${MAX_RETRIES})`);
    const result = spawnSync(
      'python3',
      [
        rendererPath,
        '--prompt',
        slot.prompt,
        '--width',
        String(slot.width),
        '--height',
        String(slot.height),
        '--output',
        outputBase,
      ],
      { stdio: 'inherit' },
    );

    if (result.status === 0) {
      success = true;
      break;
    }
  }

  if (!success) {
    console.error(`Failed rendering ${slot.slot_name} after ${MAX_RETRIES} attempts.`);
    process.exit(1);
  }
}

console.log(`Rendered ${manifest.slots?.length || 0} site image slots.`);
