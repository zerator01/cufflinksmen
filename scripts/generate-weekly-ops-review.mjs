import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const PLAN_PATH = path.join(ROOT, 'ops', 'generated', 'weekly-ops-plan.json');
const EXECUTION_LOG_PATH = path.join(ROOT, 'ops', 'ops-execution-log.md');
const OUTPUT_PATH = path.join(ROOT, 'ops', 'generated', 'weekly-ops-review.md');

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function readFileSafe(filePath) {
  return fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : '';
}

function readJsonSafe(filePath) {
  if (!fs.existsSync(filePath)) return { tasks: [] };
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function parseExecutionLog(content) {
  return content
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.startsWith('| `'))
    .map((line) => line.split('|').slice(1, -1).map((part) => part.trim()))
    .filter((parts) => parts.length >= 8)
    .map((parts) => ({
      task_id: parts[0].replaceAll('`', ''),
      status: parts[1],
      notes: parts[7],
    }));
}

const plan = readJsonSafe(PLAN_PATH);
const execution = parseExecutionLog(readFileSafe(EXECUTION_LOG_PATH));
const executionByTaskId = new Map(execution.map((item) => [item.task_id, item]));

const completed = plan.tasks.filter((task) => executionByTaskId.get(task.id)?.status === 'done');
const blocked = plan.tasks.filter((task) => executionByTaskId.get(task.id)?.status === 'blocked');
const carried = plan.tasks.filter((task) => executionByTaskId.get(task.id)?.status === 'carried_forward');
const open = plan.tasks.filter((task) => {
  const status = executionByTaskId.get(task.id)?.status;
  return !status || status === 'planned' || status === 'in_progress';
});

const completionRate = plan.tasks.length === 0 ? 0 : Math.round((completed.length / plan.tasks.length) * 100);

const markdown = `# Weekly Ops Review

- Generated at: ${new Date().toISOString()}
- Planned task count: ${plan.tasks.length}
- Completed planned tasks: ${completed.length}
- Completion rate: ${completionRate}%

## Completed

${completed.length > 0 ? completed.map((task) => `- \`${task.id}\` ${task.notes || task.id}`).join('\n') : '- No tasks marked done yet.'}

## Blocked

${blocked.length > 0 ? blocked.map((task) => `- \`${task.id}\` ${task.notes || task.id}`).join('\n') : '- No tasks marked blocked.'}

## Carried Forward

${carried.length > 0 ? carried.map((task) => `- \`${task.id}\` ${task.notes || task.id}`).join('\n') : '- No tasks marked carried forward.'}

## Still Open

${open.length > 0 ? open.map((task) => `- \`${task.id}\` ${task.notes || task.id}`).join('\n') : '- No open tasks.'}

## Next Cycle Reminder

- Carry forward only what still matters.
- Update KPI_SCORECARD before changing strategy.
- Log one insight, one loss, and one next action.
`;

ensureDir(OUTPUT_PATH);
fs.writeFileSync(OUTPUT_PATH, `${markdown}\n`);
console.log(`Wrote ${path.relative(ROOT, OUTPUT_PATH)}.`);
