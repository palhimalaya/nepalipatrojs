# Phase 1 Step 6 — Conversion algorithm assessment (ISS-003)

**Date:** 2026-11-21  
**Scope:** Assessment and benchmarks only — **no production algorithm changes**.  
**Command:** `node scripts/bench-conversion.mjs` (requires `npm run build`)  
**Raw log:** [benchmarks-step6-raw.txt](./benchmarks-step6-raw.txt)  
**Environment:** Node v24.15.0, linux x64, TZ unset  

## 1. Current algorithms

### AD → BS (`convertAdToBs`)

1. `daysDiff = gregorianDayNumber(ad) − gregorianDayNumber(REF_AD_YMD)` — **O(1)**
2. Walk forward/backward **one BS day at a time** from `REF_BS` — **O(|daysDiff|)** ≈ O(days from epoch)

**Data deps:** `BS_CALENDAR_DATA` month lengths via `getDaysInMonth`; `REF_BS` / `REF_AD_YMD`.

**Worst case:** last supported date ≈ 36,524 day iterations.

### BS → AD (`convertBsToAd`)

1. `daysFromRefBs`: sum year totals `[REF.year .. y)` + months `[1 .. m)` + day offset — **O(years + months)** ≤ O(100)
2. `addGregorianDays(REF_AD_YMD, daysDiff)` via Julian day numbers — **O(1)**

**Already fixed for correctness (ISS-019).** Not a day-walk.

### Dataset

100 years × 12 month lengths + year totals; SHA-256 pin unchanged. Span = **36,525** civil days.

## 2. Benchmark methodology

- Production APIs from `dist/nepali-patro-js.esm.js`
- Prototypes for Options B/C/D **only inside** `scripts/bench-conversion.mjs` (not in `src/`)
- Fixtures: earliest, REF, mid (2050), late (2099-12-end), leap 2024-02-29, NY 2080, 500 seeded random dates, full 36,525 bulk
- Warm-up before timed runs; median / p95 / p99 where applicable
- Prototypes checked equal to production on 500 random dates (**0 failures**)

**Limitations:** Single-machine microbenchmarks; `performance.now()` resolution; V8 warm-up; not browser. Absolute µs vary by host; **ratios** are the decision signal.

## 3. Results (production vs prototypes)

### Distance sensitivity (prod Ad→Bs) — proves O(days)

| days from REF | median latency |
|---------------|----------------|
| 0 | ~0.10 µs |
| 18,433 (mid) | ~631 µs |
| 36,524 (late) | ~1,263 µs |

### Bulk: all 36,525 dates (warm, single pass)

| Algorithm | Total | µs/op |
|-----------|-------|-------|
| **prod Ad→Bs** (day walk) | **22,908 ms** | **627** |
| prefix Ad→Bs (Option B/C) | 3.1 ms | 0.084 |
| lookup Ad→Bs (Option D) | 2.9 ms | 0.079 |
| **prod Bs→Ad** | **45.0 ms** | **1.23** |
| prefix Bs→Ad | 3.3 ms | 0.090 |

### Late date × 50,000 repeated

| Algorithm | Total | µs/op |
|-----------|-------|-------|
| prod Ad→Bs | **63,169 ms** | **1263** |
| prefix Ad→Bs | 3.3 ms | 0.066 |
| lookup Ad→Bs | 1.9 ms | 0.038 |
| prod Bs→Ad | 101 ms | 2.03 |
| prefix Bs→Ad | 3.3 ms | 0.066 |

### Init / memory (prototypes)

| Structure | Init | Memory |
|-----------|------|--------|
| Year + month prefix tables | **0.13 ms** | **~5.6 KiB** |
| Full day→BS Int32 lookup | 4.3 ms | **~143 KiB** |

## 4. Candidate comparison

| Option | Idea | Time | Memory | Complexity | Verdict |
|--------|------|------|--------|------------|---------|
| **A** Keep walk | Status quo | O(days) Ad→Bs | 0 | Lowest | **Reject for Ad→Bs** — measured ~10⁴× slower on late/bulk |
| **B** Prefix sums | Cumulative year/month offsets; binary search year + scan months | O(log Y + 12) | ~6 KiB | Low–medium | **Recommended** |
| **C** Absolute day index + prefix | Same core as B (Gregorian day index → BS via prefixes) | Same as B | Same | Same as B | **Same as B** (naming variant) |
| **D** Full lookup | `Int32[36525]` packed YMD | O(1) | ~143 KiB | Medium; init cost | Marginal win vs B; not worth memory |

**BS→AD:** Production already ~1–2 µs/op and ~45 ms for full range — **adequate**. Prefix helps ~10× but is optional if building tables for Ad→Bs anyway.

## 5. Correctness / maintainability

Any future optimization **must** preserve: dataset, REF epoch, goldens, date-only TZ independence, legacy `Date` local semantics, range errors, 36,525 round-trips.

Prefix/lookup prototypes matched production on 500 random pairs in this run. Still require full goldens + exhaustive suite after any authorized implementation.

Prefix sums stay auditable (derived only from existing `BS_CALENDAR_DATA`). Lookup duplicates the whole span in RAM for a tiny speed edge — weaker maintainability story.

## 6. Recommendation

1. **AD → BS:** Optimization **is justified**. Adopt **Option B / C** (year + month prefix tables + binary year search). Do **not** keep the day walk (Option A) given clear O(days) scaling and ~23 s full-range cost. Do **not** choose Option D unless a future product need requires absolute O(1) at the cost of 143 KiB.
2. **BS → AD:** **Keep current** absolute day-index / Gregorian add unless prefix tables are introduced for Ad→Bs — then optionally reuse them for `daysFromRefBs` (small win, shared code).
3. **Do not implement** until separately authorized.

### Implementation proposal (for approval — not done)

1. Add internal module (e.g. `bs-prefix.ts`) building lazy or module-level:
   - `yearStart[0..100]` cumulative days at each BS year start from REF
   - per-year month start offsets (or scan 12 months after year found)
2. Replace the day-by-day loop in `convertAdToBs` with: Gregorian `daysDiff` → binary search year → month scan → day.
3. Optionally point `daysFromRefBs` at the same tables.
4. No public API, dataset, or REF changes.
5. Gate merge on: goldens, TZ matrix (3 zones), 36,525 round-trips, focused benches showing late Ad→Bs ≪ 1 µs median.

## 7. Is optimization justified?

**Yes for AD→BS** — not because the walk “looks” inefficient, but because measurements show ~1.3 ms/op at range end and ~23 s to convert the supported span, with latency linear in days from REF. Typical **single** UI conversion (~1 ms) is tolerable; **library bulk / tests / far dates** are not. Prefix tables fix this with negligible memory and low complexity.
