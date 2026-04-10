import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const PLAN_PATH = path.join(ROOT, 'ops', 'generated', 'weekly-ops-plan.json');
const REVIEW_PATH = path.join(ROOT, 'ops', 'generated', 'weekly-ops-review.md');
const EXECUTION_LOG_PATH = path.join(ROOT, 'ops', 'ops-execution-log.md');
const JSON_OUTPUT_PATH = path.join(ROOT, 'ops', 'generated', 'weekly-ops-replan-input.json');
const MARKDOWN_OUTPUT_PATH = path.join(ROOT, 'ops', 'generated', 'weekly-ops-replan.md');

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
      owner: parts[2],
      executor_type: parts[3],
      executor: parts[4],
      due: parts[5],
      carry_forward_reason: parts[6],
      notes: parts[7],
    }));
}

function decisionForStatus(status) {
  if (status === 'done') return 'complete';
  if (status === 'blocked') return 're-scope';
  if (status === 'dropped') return 'drop';
  if (status === 'carried_forward') return 'carry_forward';
  if (status === 'in_progress' || status === 'planned') return 'carry_forward';
  return 'keep';
}

const plan = readJsonSafe(PLAN_PATH);
const execution = parseExecutionLog(readFileSafe(EXECUTION_LOG_PATH));
const reviewExists = fs.existsSync(REVIEW_PATH);
const executionByTaskId = new Map(execution.map((item) => [item.task_id, item]));

const decisions = plan.tasks.map((task) => {
  const executionRow = executionByTaskId.get(task.id);
  const status = executionRow?.status || 'planned';
  return {
    task_id: task.id,
    title: task.notes || task.id,
    owner: task.owner,
    executor_type: task.executor_type,
    executor: task.executor,
    status,
    decision: decisionForStatus(status),
    carry_forward_reason: task.carry_forward_reason,
  };
});

const decisionCounts = decisions.reduce((acc, item) => {
  acc[item.decision] = (acc[item.decision] || 0) + 1;
  return acc;
}, {});

const payload = {
  generated_at: new Date().toISOString(),
  site: path.basename(ROOT),
  review_exists: reviewExists,
  decisions,
  decision_counts: decisionCounts,
};

const markdown = `# Weekly Ops Replan

- Generated at: ${payload.generated_at}
- Site: \`${payload.site}\`
- Review exists: ${payload.review_exists ? 'yes' : 'no'}

## Decision Summary

- keep: ${decisionCounts.keep || 0}
- carry_forward: ${decisionCounts.carry_forward || 0}
- re-scope: ${decisionCounts['re-scope'] || 0}
- drop: ${decisionCounts.drop || 0}
- complete: ${decisionCounts.complete || 0}

## Task Decisions

| Task ID | Title | Status | Decision | Owner | Executor Type | Executor |
| --- | --- | --- | --- | --- | --- | --- |
${decisions.map((item) => `| \`${item.task_id}\` | ${item.title} | ${item.status} | ${item.decision} | ${item.owner} | ${item.executor_type} | ${item.executor} |`).join('\n')}

## Owner Gate

- \`weekly-ops-replan\` is a structured input for the next cycle, not an automatic approval.
- Keep the next cycle narrow. The main task set should stay small and attributable.
`;

ensureDir(JSON_OUTPUT_PATH);
fs.writeFileSync(JSON_OUTPUT_PATH, `${JSON.stringify(payload, null, 2)}\n`);
fs.writeFileSync(MARKDOWN_OUTPUT_PATH, `${markdown}\n`);
console.log(`Wrote ${path.relative(ROOT, MARKDOWN_OUTPUT_PATH)}.`);
