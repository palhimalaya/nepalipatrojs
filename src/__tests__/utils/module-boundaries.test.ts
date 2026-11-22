/**
 * Stage 2.4 — physical core / i18n boundary checks.
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

const SRC = join(__dirname, '../..');

function walkTs(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) {
      out.push(...walkTs(p));
    } else if (name.endsWith('.ts')) {
      out.push(p);
    }
  }
  return out;
}

function read(rel: string): string {
  return readFileSync(join(SRC, rel), 'utf8');
}

describe('Stage 2.4 physical module boundaries', () => {
  it('core/ must not import i18n, ui, or DOM APIs', () => {
    const files = walkTs(join(SRC, 'core'));
    expect(files.length).toBeGreaterThan(0);
    for (const file of files) {
      const src = readFileSync(file, 'utf8');
      expect(src).not.toMatch(/from\s+['"][^'"]*i18n[^'"]*['"]/);
      expect(src).not.toMatch(/from\s+['"][^'"]*\/ui\/[^'"]*['"]/);
      expect(src).not.toMatch(/\bdocument\./);
      expect(src).not.toMatch(/\bwindow\./);
    }
  });

  it('i18n/ must not import ui or DOM APIs', () => {
    const files = walkTs(join(SRC, 'i18n'));
    expect(files.length).toBeGreaterThan(0);
    for (const file of files) {
      const src = readFileSync(file, 'utf8');
      expect(src).not.toMatch(/from\s+['"][^'"]*\/ui\/[^'"]*['"]/);
      expect(src).not.toMatch(/\bdocument\./);
      expect(src).not.toMatch(/\bwindow\./);
    }
  });

  it('i18n may use core weekday index but not calendar month-length helpers for formatting', () => {
    const format = read('i18n/format.ts');
    expect(format).toMatch(/from\s+['"]\.\.\/core\/converters\/date-only['"]/);
    expect(format).not.toMatch(/getDaysInMonth|parseDateInput/);
  });

  it('helpers.ts compatibility shim is removed', () => {
    expect(() => read('utils/helpers.ts')).toThrow();
  });

  it('ui consumes core + i18n, not the public barrel', () => {
    const src = read('ui/NepaliDatePicker.ts');
    expect(src).toMatch(/from\s+['"]\.\.\/core\//);
    expect(src).toMatch(/from\s+['"]\.\.\/i18n\//);
    expect(src).not.toMatch(/from\s+['"]\.\.\/index['"]/);
    expect(src).not.toMatch(/BS_CALENDAR_DATA/);
  });
});
