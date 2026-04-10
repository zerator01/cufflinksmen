import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const TARGETS = [
  path.join(ROOT, 'site.config.yaml'),
  path.join(ROOT, 'content', 'final_website_copy.md'),
];

function scanFile(filePath) {
  if (!fs.existsSync(filePath)) return [];
  return fs
    .readFileSync(filePath, 'utf8')
    .split('\n')
    .map((line, index) => ({ line: index + 1, text: line }))
    .filter((entry) => entry.text.includes('/images/placeholder'));
}

const findings = TARGETS.flatMap((filePath) =>
  scanFile(filePath).map((entry) => ({
    file: path.relative(ROOT, filePath),
    line: entry.line,
    text: entry.text.trim(),
  })),
);

if (findings.length === 0) {
  console.log('No placeholder image references found.');
  process.exit(0);
}

console.log('Placeholder image references still exist:');
for (const finding of findings) {
  console.log(`- ${finding.file}:${finding.line} ${finding.text}`);
}
process.exit(1);
