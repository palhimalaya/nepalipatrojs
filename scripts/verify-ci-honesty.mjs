#!/usr/bin/env node
/**
 * Phase 5.1 — local verification that CI build/test failures propagate.
 *
 * GitHub Actions: a step without continue-on-error that exits non-zero fails
 * the job; later unconditional steps are skipped. This script models that
 * with controlled failing commands (no workflow mutation).
 */
import { readFileSync } from 'fs';
import { spawnSync } from 'child_process';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const ciPath = join(root, '.github/workflows/ci.yml');
const ci = readFileSync(ciPath, 'utf8');

function assert(cond, msg) {
  if (!cond) {
    console.error('FAIL:', msg);
    process.exit(1);
  }
  console.log('OK:', msg);
}

assert(!/continue-on-error:\s*true/.test(ci), 'ci.yml has no continue-on-error: true');
assert(/- name: Build\n\s+run: npm run build/.test(ci), 'Build step runs npm run build without soft-fail');
assert(/- name: Test\n\s+run: npm test/.test(ci), 'Test step runs npm test without soft-fail');

/**
 * Simulate job steps: stop on first non-zero (GHA default without continue-on-error).
 * @returns {{ status: 'failed'|'passed', ran: string[], exitCode: number }}
 */
function simulateJob(steps) {
  const ran = [];
  for (const step of steps) {
    ran.push(step.name);
    const result = spawnSync(step.command, {
      shell: true,
      encoding: 'utf8',
      cwd: root,
    });
    const code = result.status ?? 1;
    if (code !== 0) {
      return { status: 'failed', ran, exitCode: code, failedStep: step.name };
    }
  }
  return { status: 'passed', ran, exitCode: 0 };
}

const failBuild = simulateJob([
  { name: 'Build', command: 'node -e "process.exit(1)"' },
  { name: 'Test', command: 'node -e "console.log(\"test ran\")"' },
]);
assert(failBuild.status === 'failed', 'controlled build failure fails the simulated job');
assert(failBuild.failedStep === 'Build', 'failure attributed to Build');
assert(!failBuild.ran.includes('Test'), 'Test does not run after Build failure (no soft-fail)');

const failTest = simulateJob([
  { name: 'Build', command: 'node -e "process.exit(0)"' },
  { name: 'Test', command: 'node -e "process.exit(2)"' },
]);
assert(failTest.status === 'failed', 'controlled test failure fails the simulated job');
assert(failTest.exitCode === 2, 'test exit code propagates');
assert(failTest.ran.join(',') === 'Build,Test', 'Build then Test both attempted when Build passes');

const pass = simulateJob([
  { name: 'Build', command: 'node -e "process.exit(0)"' },
  { name: 'Test', command: 'node -e "process.exit(0)"' },
]);
assert(pass.status === 'passed', 'passing build+test passes the simulated job');

console.log('\nPhase 5.1 CI honesty verification passed.');
