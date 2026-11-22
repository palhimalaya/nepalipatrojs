import { convertADToBS } from '../../core/converters/ad-to-bs';
import { convertBSToAD } from '../../core/converters/bs-to-ad';
import { getDaysInMonth } from '../../core/calendar';
import { MAX_BS_YEAR, MIN_BS_YEAR } from '../../core/calendar-data';

/**
 * Round-trip consistency proves algorithmic invertibility against this dataset.
 * It does NOT prove historical accuracy of the month-length table (ADR-003).
 *
 * Exhaustive: 36,525 BS dates. Pre-ISS-019 ~22–32s with ~3090 failures;
 * post-fix must be 0 failures in similar wall time.
 */

type RoundTripStats = {
  total: number;
  failures: number;
  elapsedMs: number;
};

function countBsAdBsFailures(): RoundTripStats {
  const started = Date.now();
  let total = 0;
  let failures = 0;

  for (let year = MIN_BS_YEAR; year <= MAX_BS_YEAR; year++) {
    for (let month = 1; month <= 12; month++) {
      const dim = getDaysInMonth(year, month);
      for (let day = 1; day <= dim; day++) {
        total++;
        const ad = convertBSToAD({ year, month, day });
        const back = convertADToBS([
          ad.getFullYear(),
          ad.getMonth() + 1,
          ad.getDate(),
        ]);
        if (back.year !== year || back.month !== month || back.day !== day) {
          failures++;
        }
      }
    }
  }

  return { total, failures, elapsedMs: Date.now() - started };
}

describe('Conversion round-trips', () => {
  let stats: RoundTripStats;

  beforeAll(() => {
    stats = countBsAdBsFailures();
  }, 120_000);

  it('REF epoch round-trips both ways', () => {
    const bs = { year: 2000, month: 1, day: 1 };
    const ad = convertBSToAD(bs);
    expect(ad.getFullYear()).toBe(1943);
    expect(ad.getMonth() + 1).toBe(4);
    expect(ad.getDate()).toBe(14);
    expect(convertADToBS([1943, 4, 14])).toEqual(bs);
  });

  it('exhaustive BS→AD→BS: 36525/36525 with zero failures', () => {
    expect(stats.total).toBe(36525);
    expect(stats.failures).toBe(0);
    expect(stats.elapsedMs).toBeLessThan(120_000);
  });
});
