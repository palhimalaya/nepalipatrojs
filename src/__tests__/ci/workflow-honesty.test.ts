/**
 * Phase 5.1 / ISS-010 — CI honesty regressions.
 * Asserts critical build/test steps do not soft-fail via continue-on-error.
 */
import { readFileSync } from 'fs';
import { join } from 'path';

function loadWorkflow(name: string): string {
  return readFileSync(
    join(__dirname, '../../../.github/workflows', name),
    'utf8'
  );
}

/** Very small YAML step scanner — enough for our workflow shape. */
function stepsWithContinueOnError(yaml: string): string[] {
  const lines = yaml.split(/\r?\n/);
  const flagged: string[] = [];
  let currentStepName = '(unnamed)';
  let inStep = false;

  for (const raw of lines) {
    const line = raw.replace(/\t/g, '  ');
    if (/^    - /.test(line)) {
      inStep = true;
      const named = line.match(/^    - name:\s*(.+)\s*$/);
      const uses = line.match(/^    - uses:\s*(.+)\s*$/);
      if (named) {
        currentStepName = named[1].trim();
      } else if (uses) {
        currentStepName = `uses:${uses[1].trim()}`;
      } else if (line.includes('run:')) {
        currentStepName = 'run:(inline)';
      }
    }
    if (inStep && /^\s+continue-on-error:\s*true\s*$/.test(line)) {
      flagged.push(currentStepName);
    }
    // Top-level key ends step scanning for that region.
    if (/^[A-Za-z]/.test(line)) {
      inStep = false;
    }
  }
  return flagged;
}

function stepBlock(yaml: string, stepName: string): string | null {
  const lines = yaml.split(/\r?\n/);
  const start = lines.findIndex((l) =>
    l.match(new RegExp(`^    - name:\\s*${stepName}\\s*$`))
  );
  if (start < 0) return null;
  const block: string[] = [lines[start]];
  for (let i = start + 1; i < lines.length; i++) {
    if (lines[i].match(/^    - /) || lines[i].match(/^[a-zA-Z]/)) break;
    block.push(lines[i]);
  }
  return block.join('\n');
}

describe('CI workflow honesty (Phase 5.1 / ISS-010)', () => {
  const ci = loadWorkflow('ci.yml');

  it('defines Build and Test steps that run npm build/test', () => {
    const build = stepBlock(ci, 'Build');
    const test = stepBlock(ci, 'Test');
    expect(build).toBeTruthy();
    expect(test).toBeTruthy();
    expect(build!).toMatch(/npm run build/);
    expect(test!).toMatch(/npm test/);
  });

  it('does not set continue-on-error on Build', () => {
    const build = stepBlock(ci, 'Build')!;
    expect(build).not.toMatch(/continue-on-error:\s*true/);
  });

  it('does not set continue-on-error on Test', () => {
    const test = stepBlock(ci, 'Test')!;
    expect(test).not.toMatch(/continue-on-error:\s*true/);
  });

  it('has no continue-on-error: true anywhere in ci.yml', () => {
    expect(ci).not.toMatch(/continue-on-error:\s*true/);
    expect(stepsWithContinueOnError(ci)).toEqual([]);
  });

  it('keeps failure diagnostics without soft-failing the job', () => {
    const debug = stepBlock(ci, 'Debug build failures');
    expect(debug).toBeTruthy();
    expect(debug!).toMatch(/if:\s*failure\(\)/);
    expect(debug!).not.toMatch(/continue-on-error:\s*true/);
  });

  it('runs typecheck and pack smoke as hard gates (Phase 5.5)', () => {
    const typecheck = stepBlock(ci, 'Typecheck');
    const packSmoke = stepBlock(ci, 'Pack smoke');
    expect(typecheck).toMatch(/npm run typecheck/);
    expect(packSmoke).toMatch(/npm run pack:smoke/);
    expect(typecheck!).not.toMatch(/continue-on-error:\s*true/);
    expect(packSmoke!).not.toMatch(/continue-on-error:\s*true/);
  });
});

describe('publish workflow does not soft-fail build/test (Phase 5.1)', () => {
  const publish = loadWorkflow('npm-publish.yml');

  it('has no continue-on-error: true', () => {
    expect(publish).not.toMatch(/continue-on-error:\s*true/);
  });
});
