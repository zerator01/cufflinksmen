import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const OUTPUT_PATH = path.join(ROOT, 'ops', 'generated', 'weekly-ops-summary.md');
const SNAPSHOT_PATH = path.join(ROOT, 'ops', 'generated', 'ops-snapshot.json');

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function readJsonSafe(filePath) {
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

const previous = readJsonSafe(SNAPSHOT_PATH);
const current = {
  generated_at: new Date().toISOString(),
  site: path.basename(ROOT),
};

const content = `# Weekly Ops Summary

- Generated at: ${current.generated_at}
- Site: \`${current.site}\`
- Previous snapshot exists: ${previous ? 'yes' : 'no'}

## This Week's Watchlist

1. Highest-priority landing page: \`fill-me\`
2. Highest-priority PDP: \`fill-me\`
3. Highest-risk trust or conversion issue: \`fill-me\`

## Operator Notes

- Review one representative strong page.
- Review one representative weak page.
- Update the KPI scorecard before changing strategy.
- Keep strategy changes narrow and observable.
`;

ensureDir(OUTPUT_PATH);
fs.writeFileSync(SNAPSHOT_PATH, `${JSON.stringify(current, null, 2)}\n`);
fs.writeFileSync(OUTPUT_PATH, `${content}\n`);
console.log(`Wrote ${path.relative(ROOT, OUTPUT_PATH)}.`);
