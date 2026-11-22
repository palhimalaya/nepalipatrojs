/**
 * Golden AD ↔ BS fixtures for correctness baseline.
 *
 * Expected values are NOT taken from convertADToBS / convertBSToAD.
 *
 * Trust levels (different claims):
 * - project-documented: stated in this repo's constants/docs
 * - independent-public: cited external calendars / news
 * - dataset-implied: computed as REF_AD + sum(month lengths) using only
 *   BS_CALENDAR_DATA arithmetic (not the converter implementations)
 *
 * Note: some public tables disagree by one day for certain New Years
 * (e.g. merokalam lists 2078-01-01 as 2021-04-13; dataset+REF implies 2021-04-14).
 * Those conflicts are tracked under ISS-016 / ISS-019 notes — we pin dataset-implied
 * values when testing this library's table, and cite independent sources when they agree.
 */

export type Ymd = { year: number; month: number; day: number };

export interface ConversionFixture {
  id: string;
  ad: Ymd;
  bs: Ymd;
  source: string;
  trust: 'project-documented' | 'independent-public' | 'dataset-implied';
  directions: Array<'ad-to-bs' | 'bs-to-ad'>;
}

export const GOLDEN_CONVERSIONS: ConversionFixture[] = [
  {
    id: 'ref-epoch',
    ad: { year: 1943, month: 4, day: 14 },
    bs: { year: 2000, month: 1, day: 1 },
    source:
      'Project constants: src/constants/calendar-data.ts — "2000-01-01 BS == 1943-04-14 AD"',
    trust: 'project-documented',
    directions: ['ad-to-bs', 'bs-to-ad'],
  },
  {
    id: 'day-after-ref',
    ad: { year: 1943, month: 4, day: 15 },
    bs: { year: 2000, month: 1, day: 2 },
    source:
      'Project reference epoch + one Gregorian civil day (Date local fields); not from convert*.',
    trust: 'project-documented',
    directions: ['ad-to-bs', 'bs-to-ad'],
  },
  {
    id: 'ny-2078',
    ad: { year: 2021, month: 4, day: 14 },
    bs: { year: 2078, month: 1, day: 1 },
    source:
      'Dataset-implied: REF_AD + sum(totals 2000..2077) = 2021-04-14. Note: merokalam.com lists 2021-04-13 for this New Year (one-day conflict; provenance ISS-016).',
    trust: 'dataset-implied',
    directions: ['ad-to-bs', 'bs-to-ad'],
  },
  {
    id: 'ny-2079',
    ad: { year: 2022, month: 4, day: 14 },
    bs: { year: 2079, month: 1, day: 1 },
    source:
      'Dataset-implied: REF_AD + sum(totals 2000..2078) = 2022-04-14. merokalam.com lists 2022-04-13 (conflict).',
    trust: 'dataset-implied',
    directions: ['ad-to-bs', 'bs-to-ad'],
  },
  {
    id: 'ny-2080',
    ad: { year: 2023, month: 4, day: 14 },
    bs: { year: 2080, month: 1, day: 1 },
    source:
      'Independent public + dataset-implied agree: myRepublica 2023-04-14 New Year 2080; bstoadconverter.com; REF+sum(2000..2079)=2023-04-14.',
    trust: 'independent-public',
    directions: ['ad-to-bs', 'bs-to-ad'],
  },
  {
    id: 'ny-2081',
    ad: { year: 2024, month: 4, day: 13 },
    bs: { year: 2081, month: 1, day: 1 },
    source:
      'Dataset-implied REF+sum(2000..2080)=2024-04-13; merokalam.com also lists 2024-04-13 for BS 2081 Baisakh 1.',
    trust: 'independent-public',
    directions: ['ad-to-bs', 'bs-to-ad'],
  },
  {
    id: 'gregorian-leap-2024-02-29',
    ad: { year: 2024, month: 2, day: 29 },
    bs: { year: 2080, month: 11, day: 17 },
    source:
      'Independent public: calendaw.com/ad/2024, englishtonepali.com, vedicmarga.com — 29 Feb 2024 = Falgun 17, 2080 BS.',
    trust: 'independent-public',
    directions: ['ad-to-bs', 'bs-to-ad'],
  },
];
