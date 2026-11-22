/**
 * Stage 2.3 — lightweight architecture checks (no physical core/ folder yet).
 */

import { readFileSync } from 'fs';
import { join } from 'path';

const UTILS = join(__dirname, '../../utils');

function read(name: string): string {
  return readFileSync(join(UTILS, name), 'utf8');
}

describe('Stage 2.3 helper module boundaries', () => {
  it('calendar.ts has no i18n or DOM dependencies', () => {
    const src = read('calendar.ts');
    expect(src).not.toMatch(/from\s+['"].*localization['"]/);
    expect(src).not.toMatch(/NepaliMonth|NEPALI_DIGITS|document\.|window\./);
    expect(src).toMatch(/getDaysInMonth/);
    expect(src).toMatch(/parseDateInput/);
  });

  it('localization.ts has no DOM and does not import calendar helpers', () => {
    const src = read('localization.ts');
    expect(src).not.toMatch(/from\s+['"]\.\/calendar['"]/);
    expect(src).not.toMatch(/getDaysInMonth|parseDateInput/);
    expect(src).not.toMatch(/document\.|window\./);
    expect(src).toMatch(/localizeDigits/);
    expect(src).toMatch(/getDateFormatPatterns/);
  });

  it('helpers.ts is a compatibility re-export only', () => {
    const src = read('helpers.ts');
    expect(src).toMatch(/from\s+['"]\.\/calendar['"]/);
    expect(src).toMatch(/from\s+['"]\.\/localization['"]/);
    // No inline function bodies for the split helpers
    expect(src).not.toMatch(/export function getDaysInMonth/);
    expect(src).not.toMatch(/export function localizeDigits/);
  });

  it('converters do not import localization', () => {
    const dayIndex = readFileSync(
      join(__dirname, '../../converters/bs-day-index.ts'),
      'utf8'
    );
    const bsToAd = readFileSync(
      join(__dirname, '../../converters/bs-to-ad.ts'),
      'utf8'
    );
    expect(dayIndex).not.toMatch(/localization|localizeDigits|localizeMonth/);
    expect(bsToAd).not.toMatch(/localization|localizeDigits|localizeMonth/);
  });
});
