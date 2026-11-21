/**
 * Phase 1 Step 6 — Conversion algorithm assessment benchmarks.
 *
 * Assessment only: measures production converters and prototype alternatives
 * implemented locally in this script (NOT wired into src/).
 *
 * Usage:
 *   node scripts/bench-conversion.mjs
 *
 * Environment notes are printed in the report footer.
 */

import {
  convertAdToBs,
  convertBsToAd,
  getDaysInMonth,
  REF_AD_YMD,
  REF_BS,
} from '../dist/nepali-patro-js.esm.js';

const MIN_BS = 2000;
const MAX_BS = 2099;

// --- Gregorian helpers (same algorithms as src/utils/gregorian.ts) ---

function gregorianDayNumber(year, month, day) {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  return (
    day +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045
  );
}

function gregorianFromDayNumber(jdn) {
  const a = jdn + 32044;
  const b = Math.floor((4 * a + 3) / 146097);
  const c = a - Math.floor((146097 * b) / 4);
  const d = Math.floor((4 * c + 3) / 1461);
  const e = c - Math.floor((1461 * d) / 4);
  const m = Math.floor((5 * e + 2) / 153);
  const day = e - Math.floor((153 * m + 2) / 5) + 1;
  const month = m + 3 - 12 * Math.floor(m / 10);
  const year = 100 * b + d - 4800 + Math.floor(m / 10);
  return { year, month, day };
}

function addGregorianDays(date, days) {
  return gregorianFromDayNumber(
    gregorianDayNumber(date.year, date.month, date.day) + days
  );
}

function daysBetweenGregorian(a, b) {
  return (
    gregorianDayNumber(b.year, b.month, b.day) -
    gregorianDayNumber(a.year, a.month, a.day)
  );
}

// --- Build BS tables from public getDaysInMonth (cold init measured) ---

function buildPrefixTables() {
  const t0 = performance.now();
  const yearStart = new Float64Array(MAX_BS - MIN_BS + 2); // index by year-MIN_BS; last = total span
  const monthLengths = new Int16Array((MAX_BS - MIN_BS + 1) * 12);
  const monthStartInYear = new Int16Array((MAX_BS - MIN_BS + 1) * 12);

  let cumulative = 0;
  for (let y = MIN_BS; y <= MAX_BS; y++) {
    yearStart[y - MIN_BS] = cumulative;
    let yearDays = 0;
    for (let m = 1; m <= 12; m++) {
      const dim = getDaysInMonth(y, m);
      const yi = y - MIN_BS;
      monthLengths[yi * 12 + (m - 1)] = dim;
      monthStartInYear[yi * 12 + (m - 1)] = yearDays;
      yearDays += dim;
    }
    cumulative += yearDays;
  }
  yearStart[MAX_BS - MIN_BS + 1] = cumulative;
  const initMs = performance.now() - t0;
  return { yearStart, monthLengths, monthStartInYear, totalDays: cumulative, initMs };
}

/** Option B/C: day index → BS via year prefix + linear month scan (O(years) avoided via binary search on years). */
function bsFromDayIndex(dayIndex, tables) {
  const { yearStart, monthLengths, monthStartInYear } = tables;
  // Binary search year: largest y where yearStart[y] <= dayIndex
  let lo = 0;
  let hi = MAX_BS - MIN_BS;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (yearStart[mid] <= dayIndex) lo = mid;
    else hi = mid - 1;
  }
  const yi = lo;
  const year = MIN_BS + yi;
  let rem = dayIndex - yearStart[yi];
  for (let m = 1; m <= 12; m++) {
    const dim = monthLengths[yi * 12 + (m - 1)];
    const start = monthStartInYear[yi * 12 + (m - 1)];
    if (rem < start + dim) {
      return { year, month: m, day: rem - start + 1 };
    }
  }
  throw new Error('bsFromDayIndex: out of range');
}

function daysFromRefBsPrefix(bs, tables) {
  const yi = bs.year - MIN_BS;
  return (
    tables.yearStart[yi] +
    tables.monthStartInYear[yi * 12 + (bs.month - 1)] +
    (bs.day - 1)
  );
}

/** Option B/C AD→BS */
function convertAdToBsPrefix(ad, tables) {
  const daysDiff = daysBetweenGregorian(REF_AD_YMD, ad);
  return bsFromDayIndex(daysDiff, tables);
}

/** Option B BS→AD (prefix day index + Gregorian add) */
function convertBsToAdPrefix(bs, tables) {
  const daysDiff = daysFromRefBsPrefix(bs, tables);
  return addGregorianDays(REF_AD_YMD, daysDiff);
}

/** Option D: flat Int32 lookup AD dayIndex → packed BS (year<<16|month<<8|day) — memory estimate */
function buildLookupTable(tables) {
  const t0 = performance.now();
  const n = tables.totalDays;
  // Pack: year in high 16, month in next 8, day in low 8 — years 2000–2099 fit.
  const table = new Int32Array(n);
  for (let i = 0; i < n; i++) {
    const bs = bsFromDayIndex(i, tables);
    table[i] = (bs.year << 16) | (bs.month << 8) | bs.day;
  }
  const initMs = performance.now() - t0;
  const bytes = table.byteLength;
  return { table, initMs, bytes, n };
}

function convertAdToBsLookup(ad, lookup) {
  const daysDiff = daysBetweenGregorian(REF_AD_YMD, ad);
  const packed = lookup.table[daysDiff];
  return {
    year: packed >>> 16,
    month: (packed >>> 8) & 0xff,
    day: packed & 0xff,
  };
}

// --- Fixtures ---

function enumerateAllBsDates() {
  const out = [];
  for (let y = MIN_BS; y <= MAX_BS; y++) {
    for (let m = 1; m <= 12; m++) {
      const dim = getDaysInMonth(y, m);
      for (let d = 1; d <= dim; d++) out.push({ year: y, month: m, day: d });
    }
  }
  return out;
}

function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pickRandom(arr, n, seed) {
  const rnd = mulberry32(seed);
  const out = [];
  for (let i = 0; i < n; i++) out.push(arr[Math.floor(rnd() * arr.length)]);
  return out;
}

function percentile(sorted, p) {
  if (sorted.length === 0) return NaN;
  const idx = Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length));
  return sorted[idx];
}

function summarizeNs(samplesNs) {
  const s = [...samplesNs].sort((a, b) => a - b);
  return {
    n: s.length,
    min_us: s[0] / 1e3,
    median_us: percentile(s, 50) / 1e3,
    p95_us: percentile(s, 95) / 1e3,
    p99_us: percentile(s, 99) / 1e3,
    max_us: s[s.length - 1] / 1e3,
  };
}

/** Time one call many times; return per-call ns samples (batched wall / iterations). */
function benchOne(fn, iterations) {
  // Warm
  for (let i = 0; i < 50; i++) fn();
  const samples = [];
  for (let i = 0; i < iterations; i++) {
    const t0 = performance.now();
    fn();
    samples.push((performance.now() - t0) * 1e6); // ns
  }
  return summarizeNs(samples);
}

/** Bulk: convert all items once; return total ms and per-op us */
function benchBulk(label, items, fn) {
  // Warm first 100
  for (let i = 0; i < Math.min(100, items.length); i++) fn(items[i]);
  const t0 = performance.now();
  for (let i = 0; i < items.length; i++) fn(items[i]);
  const ms = performance.now() - t0;
  return {
    label,
    count: items.length,
    total_ms: ms,
    per_op_us: (ms * 1000) / items.length,
    ops_per_sec: items.length / (ms / 1000),
  };
}

function eq(a, b) {
  return a.year === b.year && a.month === b.month && a.day === b.day;
}

function assertCorrectness(tables, lookup, sampleBs, sampleAd) {
  let fail = 0;
  for (const bs of sampleBs) {
    const prod = convertBsToAd(bs);
    const pref = convertBsToAdPrefix(bs, tables);
    if (!eq(prod, pref)) fail++;
  }
  for (const ad of sampleAd) {
    const prod = convertAdToBs(ad);
    const pref = convertAdToBsPrefix(ad, tables);
    const look = convertAdToBsLookup(ad, lookup);
    if (!eq(prod, pref) || !eq(prod, look)) fail++;
  }
  return fail;
}

// --- Main ---

const hr = () => console.log('-'.repeat(72));

console.log('NepaliPatroJS — Phase 1 Step 6 conversion benchmarks');
hr();
console.log(`Node: ${process.version}`);
console.log(`Platform: ${process.platform} ${process.arch}`);
console.log(`TZ: ${process.env.TZ ?? '(unset)'}`);
console.log(`Time: ${new Date().toISOString()}`);
hr();

const allBs = enumerateAllBsDates();
console.log(`Enumerated BS dates: ${allBs.length}`);

const allAd = allBs.map((bs) => convertBsToAd(bs));

const fixtures = {
  earliest_bs: { year: 2000, month: 1, day: 1 },
  ref_ad: { ...REF_AD_YMD },
  mid_bs: { year: 2050, month: 6, day: 15 },
  late_bs: {
    year: 2099,
    month: 12,
    day: getDaysInMonth(2099, 12),
  },
  leap_ad: { year: 2024, month: 2, day: 29 },
  ny_2080_ad: { year: 2023, month: 4, day: 14 },
};

fixtures.earliest_ad = convertBsToAd(fixtures.earliest_bs);
fixtures.mid_ad = convertBsToAd(fixtures.mid_bs);
fixtures.late_ad = convertBsToAd(fixtures.late_bs);

const randomBs = pickRandom(allBs, 500, 42);
const randomAd = randomBs.map((bs) => convertBsToAd(bs));

// Cold init: prefix + lookup
const tables = buildPrefixTables();
console.log(
  `Prefix tables init: ${tables.initMs.toFixed(3)} ms | totalDays=${tables.totalDays} | ~${(
    tables.yearStart.byteLength +
    tables.monthLengths.byteLength +
    tables.monthStartInYear.byteLength
  ).toLocaleString()} bytes`
);

const lookup = buildLookupTable(tables);
console.log(
  `Lookup table init: ${lookup.initMs.toFixed(3)} ms | entries=${lookup.n} | ${(
    lookup.bytes / 1024
  ).toFixed(1)} KiB`
);

const fails = assertCorrectness(tables, lookup, randomBs, randomAd);
console.log(`Prototype vs production correctness (500 random): failures=${fails}`);
if (fails !== 0) {
  console.error('ABORT: prototypes disagree with production');
  process.exit(1);
}
hr();

console.log('Single-conversion latency (500 timed calls each, after warm-up)');
const singleRows = [];

function row(name, dir, fn) {
  const s = benchOne(fn, 500);
  singleRows.push({ name, dir, ...s });
  console.log(
    `  ${name.padEnd(28)} ${dir.padEnd(8)} median=${s.median_us.toFixed(3)}µs  p95=${s.p95_us.toFixed(3)}µs  p99=${s.p99_us.toFixed(3)}µs  max=${s.max_us.toFixed(3)}µs`
  );
}

const named = [
  ['earliest', fixtures.earliest_ad, fixtures.earliest_bs],
  ['ref', fixtures.ref_ad, fixtures.earliest_bs],
  ['mid', fixtures.mid_ad, fixtures.mid_bs],
  ['late', fixtures.late_ad, fixtures.late_bs],
  ['leap', fixtures.leap_ad, convertAdToBs(fixtures.leap_ad)],
  ['ny2080', fixtures.ny_2080_ad, convertAdToBs(fixtures.ny_2080_ad)],
];

for (const [name, ad, bs] of named) {
  row(`prod Ad→Bs (${name})`, 'Ad→Bs', () => convertAdToBs(ad));
  row(`prefix Ad→Bs (${name})`, 'Ad→Bs', () => convertAdToBsPrefix(ad, tables));
  row(`lookup Ad→Bs (${name})`, 'Ad→Bs', () => convertAdToBsLookup(ad, lookup));
  row(`prod Bs→Ad (${name})`, 'Bs→Ad', () => convertBsToAd(bs));
  row(`prefix Bs→Ad (${name})`, 'Bs→Ad', () => convertBsToAdPrefix(bs, tables));
}

hr();
console.log('Random single conversions (500 distinct dates, one timed call each)');
{
  const prodAd = [];
  const prefAd = [];
  const lookAd = [];
  const prodBs = [];
  const prefBs = [];
  for (let i = 0; i < randomAd.length; i++) {
    const ad = randomAd[i];
    const bs = randomBs[i];
    let t0 = performance.now();
    convertAdToBs(ad);
    prodAd.push((performance.now() - t0) * 1e6);
    t0 = performance.now();
    convertAdToBsPrefix(ad, tables);
    prefAd.push((performance.now() - t0) * 1e6);
    t0 = performance.now();
    convertAdToBsLookup(ad, lookup);
    lookAd.push((performance.now() - t0) * 1e6);
    t0 = performance.now();
    convertBsToAd(bs);
    prodBs.push((performance.now() - t0) * 1e6);
    t0 = performance.now();
    convertBsToAdPrefix(bs, tables);
    prefBs.push((performance.now() - t0) * 1e6);
  }
  const print = (label, samples) => {
    const s = summarizeNs(samples);
    console.log(
      `  ${label.padEnd(28)} median=${s.median_us.toFixed(3)}µs  p95=${s.p95_us.toFixed(3)}µs  p99=${s.p99_us.toFixed(3)}µs`
    );
  };
  print('prod Ad→Bs (random)', prodAd);
  print('prefix Ad→Bs (random)', prefAd);
  print('lookup Ad→Bs (random)', lookAd);
  print('prod Bs→Ad (random)', prodBs);
  print('prefix Bs→Ad (random)', prefBs);
}

hr();
console.log('Bulk throughput (all 36,525 dates, single pass, warm)');
const bulk = [
  benchBulk('prod Ad→Bs', allAd, (ad) => convertAdToBs(ad)),
  benchBulk('prefix Ad→Bs', allAd, (ad) => convertAdToBsPrefix(ad, tables)),
  benchBulk('lookup Ad→Bs', allAd, (ad) => convertAdToBsLookup(ad, lookup)),
  benchBulk('prod Bs→Ad', allBs, (bs) => convertBsToAd(bs)),
  benchBulk('prefix Bs→Ad', allBs, (bs) => convertBsToAdPrefix(bs, tables)),
];
for (const b of bulk) {
  console.log(
    `  ${b.label.padEnd(28)} ${b.total_ms.toFixed(1)} ms  ${b.per_op_us.toFixed(3)} µs/op  ${Math.round(b.ops_per_sec).toLocaleString()} ops/s`
  );
}

hr();
console.log('Repeated conversion (same late date × 50_000, warm)');
{
  const ad = fixtures.late_ad;
  const bs = fixtures.late_bs;
  const N = 50_000;
  const run = (label, fn) => {
    for (let i = 0; i < 100; i++) fn();
    const t0 = performance.now();
    for (let i = 0; i < N; i++) fn();
    const ms = performance.now() - t0;
    console.log(
      `  ${label.padEnd(28)} ${ms.toFixed(1)} ms  ${(ms * 1000) / N} µs/op`
    );
  };
  run('prod Ad→Bs (late×50k)', () => convertAdToBs(ad));
  run('prefix Ad→Bs (late×50k)', () => convertAdToBsPrefix(ad, tables));
  run('lookup Ad→Bs (late×50k)', () => convertAdToBsLookup(ad, lookup));
  run('prod Bs→Ad (late×50k)', () => convertBsToAd(bs));
  run('prefix Bs→Ad (late×50k)', () => convertBsToAdPrefix(bs, tables));
}

hr();
console.log('Distance sensitivity (prod Ad→Bs median µs vs days from REF)');
{
  const points = [
    fixtures.earliest_ad,
    fixtures.mid_ad,
    fixtures.late_ad,
  ];
  for (const ad of points) {
    const days = daysBetweenGregorian(REF_AD_YMD, ad);
    const s = benchOne(() => convertAdToBs(ad), 300);
    console.log(
      `  daysFromRef=${String(days).padStart(5)}  median=${s.median_us.toFixed(3)}µs  p95=${s.p95_us.toFixed(3)}µs`
    );
  }
}

hr();
console.log('JSON summary (machine-readable)');
const summary = {
  node: process.version,
  platform: `${process.platform}-${process.arch}`,
  tz: process.env.TZ ?? null,
  totalBsDates: allBs.length,
  prefixInitMs: tables.initMs,
  lookupInitMs: lookup.initMs,
  lookupKiB: lookup.bytes / 1024,
  bulk: bulk.map((b) => ({
    label: b.label,
    total_ms: b.total_ms,
    per_op_us: b.per_op_us,
  })),
  lateProdAdToBsMedianUs: singleRows.find((r) => r.name.includes('prod Ad→Bs (late)'))
    ?.median_us,
  latePrefixAdToBsMedianUs: singleRows.find((r) =>
    r.name.includes('prefix Ad→Bs (late)')
  )?.median_us,
};
console.log(JSON.stringify(summary, null, 2));
