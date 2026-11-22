/**
 * Stage 2.5 / ISS-018 — architecture boundary enforcement.
 * Positive: current tree must satisfy rules.
 * Negative: synthetic fixtures must be detected as violations.
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import {
  buildImportGraph,
  checkFacadeDatasetPrivacy,
  checkFileSource,
  checkPackageExports,
  classifyPath,
  extractImportSpecifiers,
  scanRepository,
  stripComments,
} from './boundary-enforcement';

const SRC = join(__dirname, '../..');
const PKG = join(__dirname, '../../../package.json');

describe('Stage 2.5 architecture rules (positive — current tree)', () => {
  it('scans production src with zero boundary violations', () => {
    const violations = scanRepository(SRC, PKG);
    expect(violations).toEqual([]);
  });

  it('builds an acyclic import graph among production modules', () => {
    const { cycles, edges } = buildImportGraph(SRC);
    expect(edges.length).toBeGreaterThan(0);
    expect(cycles).toEqual([]);
  });

  it('classifies layers from paths', () => {
    expect(classifyPath(join(SRC, 'core/calendar.ts'), SRC)).toBe('core');
    expect(classifyPath(join(SRC, 'i18n/format.ts'), SRC)).toBe('i18n');
    expect(classifyPath(join(SRC, 'ui/NepaliDatePicker.ts'), SRC)).toBe('ui');
    expect(classifyPath(join(SRC, 'index.ts'), SRC)).toBe('facade');
  });

  it('ui may import core and i18n but not the facade barrel', () => {
    const ui = readFileSync(join(SRC, 'ui/NepaliDatePicker.ts'), 'utf8');
    const v = checkFileSource(join(SRC, 'ui/NepaliDatePicker.ts'), ui, SRC);
    expect(v).toEqual([]);
    expect(ui).toMatch(/from\s+['"]\.\.\/core\//);
    expect(ui).toMatch(/from\s+['"]\.\.\/i18n\//);
  });

  it('public facade does not expose BS_CALENDAR_DATA', () => {
    const index = readFileSync(join(SRC, 'index.ts'), 'utf8');
    expect(checkFacadeDatasetPrivacy(index)).toEqual([]);
    expect(stripComments(index)).not.toMatch(/\bBS_CALENDAR_DATA\b/);
  });

  it('package.json has no deep ./core export', () => {
    const pkg = JSON.parse(readFileSync(PKG, 'utf8'));
    expect(checkPackageExports(pkg)).toEqual([]);
  });
});

describe('Stage 2.5 architecture rules (negative — must detect violations)', () => {
  const fakeCore = join(SRC, 'core/__fixture_violation__.ts');
  const fakeI18n = join(SRC, 'i18n/__fixture_violation__.ts');
  const fakeUi = join(SRC, 'ui/__fixture_violation__.ts');

  it('detects core → i18n static import', () => {
    const src = `import { formatBS } from '../i18n/format';\n`;
    const v = checkFileSource(fakeCore, src, SRC, 'core');
    expect(v.some((x) => x.rule === 'core-no-i18n')).toBe(true);
  });

  it('detects core → i18n dynamic import()', () => {
    const src = `export async function bad() { return import('../i18n/localization'); }\n`;
    const specs = extractImportSpecifiers(src);
    expect(specs.some((s) => s.kind === 'dynamic')).toBe(true);
    const v = checkFileSource(fakeCore, src, SRC, 'core');
    expect(v.some((x) => x.rule === 'core-no-i18n')).toBe(true);
  });

  it('detects core → ui import', () => {
    const src = `import { NepaliDatePicker } from '../ui/NepaliDatePicker';\n`;
    const v = checkFileSource(fakeCore, src, SRC, 'core');
    expect(v.some((x) => x.rule === 'core-no-ui')).toBe(true);
  });

  it('detects core DOM usage', () => {
    const src = `export function bad() { return document.getElementById('x'); }\n`;
    const v = checkFileSource(fakeCore, src, SRC, 'core');
    expect(v.some((x) => x.rule === 'core-no-dom')).toBe(true);
  });

  it('detects i18n → ui import', () => {
    const src = `import { NepaliDatePicker } from '../ui/NepaliDatePicker';\n`;
    const v = checkFileSource(fakeI18n, src, SRC, 'i18n');
    expect(v.some((x) => x.rule === 'i18n-no-ui')).toBe(true);
  });

  it('detects i18n DOM usage', () => {
    const src = `export const w = window.innerWidth;\n`;
    const v = checkFileSource(fakeI18n, src, SRC, 'i18n');
    expect(v.some((x) => x.rule === 'i18n-no-dom')).toBe(true);
  });

  it('detects internal module importing public barrel index.ts', () => {
    const src = `import { getDaysInMonth } from '../index';\n`;
    const v = checkFileSource(fakeUi, src, SRC, 'ui');
    expect(v.some((x) => x.rule === 'no-barrel-import')).toBe(true);
  });

  it('detects require() of prohibited layer', () => {
    const src = `const x = require('../i18n/format');\n`;
    const v = checkFileSource(fakeCore, src, SRC, 'core');
    expect(v.some((x) => x.rule === 'core-no-i18n')).toBe(true);
  });

  it('detects BS_CALENDAR_DATA leaking into facade', () => {
    const src = `export { BS_CALENDAR_DATA } from './core/calendar-data';\n`;
    const v = checkFacadeDatasetPrivacy(src);
    expect(v.some((x) => x.rule === 'dataset-unpublished')).toBe(true);
  });

  it('detects deep package export ./core', () => {
    const v = checkPackageExports({ exports: { '.': {}, './core': './dist/core.js' } });
    expect(v.some((x) => x.rule === 'no-deep-core-export')).toBe(true);
  });

  it('does not false-positive on DOM words inside comments', () => {
    const src = `// document and window are forbidden in core\nexport const x = 1;\n`;
    const v = checkFileSource(fakeCore, src, SRC, 'core');
    expect(v.filter((x) => x.rule === 'core-no-dom')).toEqual([]);
  });
});
