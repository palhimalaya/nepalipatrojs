/**
 * Phase 2 Stage 2.1 — public API compatibility + circular-import regression.
 * Must keep working after breaking index ↔ NepaliDatePicker cycle.
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import NepaliPatro, {
  NepaliPatro as NamedNepaliPatro,
  NepaliDatePicker,
  convertADToBS,
  convertBSToAD,
  convertAdToBs,
  convertBsToAd,
  formatBSDate,
  getCurrentBSDate,
  getDaysInMonth,
  REF_AD_YMD,
  REF_BS,
} from '../index';

const SRC_ROOT = join(__dirname, '..');

describe('Stage 2.1 public API compatibility', () => {
  it('default and named NepaliPatro are the same facade', () => {
    expect(NepaliPatro).toBe(NamedNepaliPatro);
    // Static methods wrap named exports (not necessarily same function identity)
    expect(NepaliPatro.convertADToBS([2023, 4, 14])).toEqual(
      convertADToBS([2023, 4, 14])
    );
    expect(NepaliPatro.formatBS({ year: 2080, month: 1, day: 1 })).toBe(
      formatBSDate({ year: 2080, month: 1, day: 1 })
    );
  });

  it('named conversion and formatting imports work', () => {
    expect(convertADToBS([2023, 4, 14])).toEqual({
      year: 2080,
      month: 1,
      day: 1,
    });
    const ad = convertBSToAD({ year: 2080, month: 1, day: 1 });
    expect(ad.getFullYear()).toBe(2023);
    expect(ad.getMonth() + 1).toBe(4);
    expect(ad.getDate()).toBe(14);
    expect(convertAdToBs(REF_AD_YMD)).toEqual(REF_BS);
    expect(convertBsToAd(REF_BS)).toEqual(REF_AD_YMD);
    expect(getDaysInMonth(2080, 1)).toBe(31);
    expect(typeof getCurrentBSDate().year).toBe('number');
  });

  it('NepaliDatePicker named import constructs and destroys', () => {
    document.body.innerHTML = '<input id="dp" />';
    const input = document.getElementById('dp') as HTMLInputElement;
    const dp = new NepaliDatePicker(input, { format: 'YYYY-MM-DD' });
    input.click();
    expect(document.querySelector('.nepali-datepicker')).toBeTruthy();
    dp.destroy();
    expect(document.querySelector('.nepali-datepicker')).toBeFalsy();
  });
});

describe('Stage 2.1 circular dependency regression', () => {
  it('NepaliDatePicker.ts must not import from the public barrel ../index', () => {
    const src = readFileSync(join(SRC_ROOT, 'ui/NepaliDatePicker.ts'), 'utf8');
    expect(src).not.toMatch(/from\s+['"]\.\.\/index['"]/);
    expect(src).not.toMatch(/from\s+['"]\.\.\/index\.ts['"]/);
  });

  it('index.ts still exports NepaliDatePicker (barrel remains public entry)', () => {
    const src = readFileSync(join(SRC_ROOT, 'index.ts'), 'utf8');
    expect(src).toMatch(/from\s+['"]\.\/ui\/NepaliDatePicker['"]/);
    expect(src).toMatch(/export\s*\{[\s\S]*NepaliDatePicker/);
  });
});

describe('Stage 2.2 raw calendar data regression', () => {
  it('NepaliDatePicker.ts must not reference BS_CALENDAR_DATA', () => {
    const src = readFileSync(join(SRC_ROOT, 'ui/NepaliDatePicker.ts'), 'utf8');
    expect(src).not.toMatch(/BS_CALENDAR_DATA/);
  });
});

describe('Stage 2.1 UMD / browser globals (built artifact)', () => {
  it('UMD bundle exposes NepaliPatro global and window.NepaliDatePicker side effect', () => {
    const umdPath = join(__dirname, '../../dist/nepali-patro-js.umd.js');
    const code = readFileSync(umdPath, 'utf8');

    // Structural guarantees from Rollup UMD + index.ts side effect
    expect(code).toMatch(/NepaliPatro/);
    expect(code).toMatch(/NepaliDatePicker/);
    expect(code).toMatch(/window\.NepaliDatePicker\s*=/);

    // Load UMD into jsdom window
    // eslint-disable-next-line no-new-func
    const loader = new Function('window', 'globalThis', `${code}`);
    loader(window, window);

    const root = window as unknown as {
      NepaliPatro: {
        convertADToBS: (d: number[]) => { year: number; month: number; day: number };
      };
      NepaliDatePicker: new (
        el: HTMLInputElement,
        opts?: { format?: string }
      ) => { destroy: () => void };
    };

    expect(typeof root.NepaliPatro.convertADToBS).toBe('function');
    expect(root.NepaliPatro.convertADToBS([2023, 4, 14])).toEqual({
      year: 2080,
      month: 1,
      day: 1,
    });
    expect(typeof root.NepaliDatePicker).toBe('function');

    document.body.innerHTML = '<input id="umd-dp" />';
    const input = document.getElementById('umd-dp') as HTMLInputElement;
    const dp = new root.NepaliDatePicker(input, { format: 'YYYY-MM-DD' });
    expect(dp).toBeTruthy();
    dp.destroy();
  });
});

describe('Stage 2.1 CSS entry unchanged', () => {
  it('package exports ./css path still points at nepali-patro-js.css', () => {
    const pkg = JSON.parse(
      readFileSync(join(__dirname, '../../package.json'), 'utf8')
    );
    expect(pkg.exports['./css']).toBe('./dist/nepali-patro-js.css');
    expect(
      readFileSync(join(__dirname, '../../dist/nepali-patro-js.css'), 'utf8')
        .length
    ).toBeGreaterThan(0);
  });
});
