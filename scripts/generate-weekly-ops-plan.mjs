import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const EXECUTION_LOG_PATH = path.join(ROOT, 'ops', 'ops-execution-log.md');
const JSON_OUTPUT_PATH = path.join(ROOT, 'ops', 'generated', 'weekly-ops-plan.json');
const MARKDOWN_OUTPUT_PATH = path.join(ROOT, 'ops', 'generated', 'weekly-ops-plan.md');

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function readFileSafe(filePath) {
  return fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : '';
}

function parseExecutionLog(content) {
  return content
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.startsWith('| `'))
    .map((line) => line.split('|').slice(1, -1).map((part) => part.trim()))
    .filter((parts) => parts.length >= 8)
    .map((parts) => ({
      id: parts[0].replaceAll('`', ''),
      status: parts[1],
      owner: parts[2],
      executor_type: parts[3],
      executor: parts[4],
      due: parts[5],
      carry_forward_reason: parts[6],
      notes: parts[7],
    }));
}

const tasks = parseExecutionLog(readFileSafe(EXECUTION_LOG_PATH));
const payload = {
  generated_at: new Date().toISOString(),
  site: path.basename(ROOT),
  tasks,
};

const markdown = `# Weekly Ops Plan

- Generated at: ${payload.generated_at}
- Site: \`${payload.site}\`
- Operating model: \`single owner + multi executor\`

## Planned Tasks

| Task ID | Title | Owner | Executor Type | Executor | Status | Due | Carry Forward Reason |
| --- | --- | --- | --- | --- | --- | --- | --- |
${tasks.map((task) => `| \`${task.id}\` | ${task.notes || task.id} | ${task.owner} | ${task.executor_type} | ${task.executor} | ${task.status} | ${task.due} | ${task.carry_forward_reason} |`).join('\n')}

## Guidance

- Keep one merchandising focus per cycle.
- Do not change product copy, policy pages, and UX all at once.
- Carry forward only work that is still strategically valid.
`;

ensureDir(JSON_OUTPUT_PATH);
fs.writeFileSync(JSON_OUTPUT_PATH, `${JSON.stringify(payload, null, 2)}\n`);
fs.writeFileSync(MARKDOWN_OUTPUT_PATH, `${markdown}\n`);
console.log(`Wrote ${path.relative(ROOT, MARKDOWN_OUTPUT_PATH)}.`);
