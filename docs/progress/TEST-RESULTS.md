# Test results

Never record a pass unless the command was executed successfully in this environment.

---

## 2026-11-21 — Phase 1 Step 1: Environment & baseline

### Environment

| Item | Value |
|------|--------|
| OS | Linux (Fedora kernel host) |
| Node | **v24.15.0** (CI matrix is 18.x / 20.x — local newer) |
| npm | **11.12.1** |
| Lockfile | `package-lock.json` present |
| `npm ci` | **PASS** (455 packages added, ~11s) |
| npm audit (informational) | 15 vulnerabilities reported (1 low, 3 moderate, 11 high) — **not fixed** this phase |
| npm warn | `Unknown env config "devdir"` (environment noise) |

### Commands executed

```bash
node -v                    # v24.15.0
npm -v                     # 11.12.1
npm ci                     # exit 0
npm test                   # exit 0
npm run build              # exit 0
npx tsc --noEmit           # exit 0
```

### Unit tests — `npm test`

| Metric | Result |
|--------|--------|
| Suites | 5 passed, 5 total |
| Tests | **53 passed, 53 total** |
| Exit code | **0** |
| Coverage (stmts) | ~80% overall |

**Critical caveat:** A green suite does **not** mean the library is correct. Existing tests share incorrect assumptions with the buggy code (especially validation indexing and formatter tokens using Baisakh-only fixtures).

### Manual defect probes (source via `tsx`, not part of Jest suite)

| Probe | Result |
|-------|--------|
| `validateBsDate(2080, 2, 33)` Jestha max 32 | **NO THROW** (bug ISS-001) |
| `validateBsDate(2080, 9, 30)` Poush max 29 | **NO THROW** (bug ISS-001) |
| `validateBsDate(2080, 1, 32)` Baisakh max 31 | **NO THROW** (bug ISS-001) |
| `validateBsDate(2080, 1, 15)` valid | NO THROW (expected) |
| `formatBS(Mangsir…, 'MMMM D, YYYY')` | **`8angsir 5, 2080`** (ISS-006) |
| `formatBS(Magh…, 'MMMM D, YYYY')` | **`10agh 5, 2080`** (ISS-006) |
| `formatBS(…, 'dddd')` on Budhabar | **`Bu4habar`** (ISS-006) |

### Build — `npm run build`

| Metric | Result |
|--------|--------|
| Exit code | **0** |
| Outputs | `dist/nepali-patro-js.umd.js`, `.esm.js`, `.css`, plus sourcemaps |
| Declarations | `dist/index.d.ts` (+ nested `.d.ts`) **present after build** (Rollup TS plugin) |
| `dist/only-styles.css` | **MISSING** (ISS-009) |
| `dist/only-css.js` | Generated empty chunk warning |

**Build warnings (non-fatal):**

1. Circular dependency: `src/index.ts → src/ui/NepaliDatePicker.ts → src/index.ts` (ISS-011)
2. Mixing named and default exports
3. Empty chunk `"only-css"`
4. Browserslist data stale notice

### Typecheck — `npx tsc --noEmit`

| Metric | Result |
|--------|--------|
| Exit code | **0** |
| Dedicated npm script | **None** (`typecheck` not in package.json) |

### Baseline failure / risk register (pre-fix)

| ID | Observable at baseline? | Jest catches it? |
|----|-------------------------|------------------|
| ISS-001 BS validation | Yes (manual probe) | **No** |
| ISS-006 formatter corruption | Yes (manual probe) | **No** |
| ISS-008 missing types | Partially mitigated after build emits `.d.ts`; still not in committed gitignore allowlist | N/A |
| ISS-009 `./styles` export | Yes — file missing | N/A |
| ISS-010 CI continue-on-error | Not re-run | N/A |
| ISS-011 circular dependency | Yes — Rollup warning | N/A |

### Honest summary

- Install, Jest, build, and `tsc --noEmit` are **green** on Node 24.
- Known critical correctness bugs **remain** and are **not** detected by the current test suite.
- Next work must add independent regression tests before/with fixes — do not trust the green baseline as proof of correctness.

---

## 2026-11-21 — Phase 1 Step 2: ISS-001 fixed

### Commands

```bash
npx jest src/__tests__/utils/validations.test.ts   # PASS — 27 tests in file
npm test                                           # PASS — 63/63 (baseline was 53)
npx tsc --noEmit                                   # PASS
npm run build                                      # PASS (same warnings as baseline)
```

### Manual probes (post-fix)

| Call | Result |
|------|--------|
| `validateBsDate(2080, 2, 33)` | THROWS (was NO THROW) |
| `validateBsDate(2080, 9, 30)` | THROWS (was NO THROW) |
| `validateBsDate(2080, 1, 32)` | THROWS (was NO THROW) |

### Coverage of new regressions

- All 12 months × years `{2000, 2078, 2080, 2081, 2099}`: first day, last day, last+1
- Expected lengths from `BS_CALENDAR_DATA[year][0][month-1]` / `getDaysInMonth` — not from `validateBsDate`

### Compared to baseline

| Metric | Baseline | After ISS-001 |
|--------|----------|---------------|
| Jest | 53 pass | **63 pass** |
| ISS-001 probes | fail (accept invalid) | **pass (reject)** |
| ISS-006 probes | still fail | unchanged (out of scope) |
| Build warnings | circular dep, etc. | unchanged |

---

## 2026-11-21 — Phase 1 Step 3: ISS-006 fixed

### Strategy

Longest-first single-pass token regex:

`/[([^\]]*)\]|YYYY|YY|MMMM|MMM|MM|M|dddd|ddd|DD|D|d/g`

Bracket groups emit literals. Token values are never rescanned.

### Commands

```bash
npx jest src/__tests__/formatters/date-formatter.test.ts   # PASS — 41 tests
npm test                                                   # PASS — 96/96
npx tsc --noEmit                                           # PASS
npm run build                                              # PASS
```

### Before → after

| Input | Before | After |
|-------|--------|-------|
| Mangsir `MMMM D, YYYY` | `8angsir 5, 2080` | `Mangsir 5, 2080` |
| Magh `MMMM D, YYYY` | `10agh 5, 2080` | `Magh 5, 2080` |
| Budhabar `dddd` | `Bu4habar` | `Budhabar` |

### Compared to prior step

| Metric | After ISS-001 | After ISS-006 |
|--------|---------------|---------------|
| Jest | 63 pass | **96 pass** |
| ISS-006 probes | fail | **pass** |

---

## 2026-11-21 — Phase 1 Step 4: Conversion correctness baseline

### Three correctness layers

| Layer | Result |
|-------|--------|
| Structural integrity | **PASS** — contiguous 2000–2099, 12 months, totals match, SHA-256 `f9c4b277…b29f` |
| Golden accuracy | **AD→BS PASS** for sourced fixtures; **BS→AD** mostly wrong (ISS-019); `it.failing` gates for broken cases |
| Round-trip consistency | Exhaustive 36525 dates: **~3090 failures**, ~22–32s; REF ok; `it.failing` for zero-failure gate |

### Commands

```bash
npx jest src/__tests__/conversion --runInBand   # PASS (27) ~35s incl. exhaustive
npm test -- --runInBand                         # PASS 124/124
npx tsc --noEmit                                # PASS
npm run build                                   # PASS
```

### Provenance (ISS-016)

No source in git/docs. One-day conflicts with some public New Year tables for 2078/2079 noted in fixtures.

### Compared to prior step

| Metric | After ISS-006 | After Step 4 |
|--------|---------------|--------------|
| Jest | 96 pass | **124 pass** |
| ISS-019 | unknown | **documented** |

---

## 2026-11-21 — ISS-019: BS→AD arithmetic fix

### Root cause / correction

Old `daysBetweenBS` month-cursor loop over-counted same-month spans and added a full next Baisakh on year rollover. Replaced with absolute day indices from `REF_BS` (year totals + month lengths + day offset). Dataset and REF unchanged.

### Three correctness layers

| Layer | Result |
|-------|--------|
| Structural integrity | **PASS** — unchanged SHA-256 `f9c4b277…b29f` |
| Golden accuracy | **PASS** — AD→BS and BS→AD (including 2080-01-01 → 2023-04-14) |
| Round-trip consistency | Exhaustive **36525 / 36525**, **0 failures** (~25–31s; prior baseline ~22–32s with ~3090 fails) |

### Commands

```bash
npx jest src/__tests__/conversion --runInBand   # PASS 34 ~33s
npm test -- --runInBand --coverage=false        # PASS 131/131 ~24s
npm test -- --runInBand                         # PASS 131/131 ~33s (coverage)
npx tsc --noEmit                                # PASS
npm run build                                   # PASS
```

### Notes

- Temporary `it.failing` gates removed; none remain.
- Formatter weekday expectations for 2080-01-01..07 corrected to Fri–Thu from 2023-04-14 (were encoded against buggy 2023-05-15).
- ISS-016 provenance still unresolved; external one-day New Year disagreements stay documented.

### Compared to prior step

| Metric | After Step 4 | After ISS-019 |
|--------|--------------|---------------|
| Jest | 124 (with `.failing`) | **131 pass** |
| Round-trip failures | ~3090 | **0** |
| ISS-019 | open | **resolved** |

---

## 2026-11-21 — Phase 1 Step 5: Timezone verification

### Node

`v24.15.0`

### Date-only matrix (focused)

```bash
TZ=UTC npx jest src/__tests__/conversion/timezone-date-semantics.test.ts --runInBand --coverage=false
TZ=Asia/Kathmandu npx jest src/__tests__/conversion/timezone-date-semantics.test.ts --runInBand --coverage=false
TZ=America/Los_Angeles npx jest src/__tests__/conversion/timezone-date-semantics.test.ts --runInBand --coverage=false
```

| TZ | Result | Tests | Time |
|----|--------|-------|------|
| UTC | PASS | 16/16 | ~1.2s |
| Asia/Kathmandu | PASS | 16/16 | ~1.2s |
| America/Los_Angeles | PASS | 16/16 | ~1.3s |

### Full suite under each TZ

```bash
TZ=UTC npm test -- --runInBand --coverage=false
TZ=Asia/Kathmandu npm test -- --runInBand --coverage=false
TZ=America/Los_Angeles npm test -- --runInBand --coverage=false
```

| TZ | Result | Tests | Time |
|----|--------|-------|------|
| UTC | PASS | **150/150** | ~24.8s |
| Asia/Kathmandu | PASS | **150/150** | ~23.5s |
| America/Los_Angeles | PASS | **150/150** | ~23.7s |

Exhaustive round-trips remain **36525/36525** (included in conversion suite).

### Other

```bash
npx tsc --noEmit   # PASS
npm run build      # PASS
```

### Findings recorded

- Date-only civil results identical across three TZs.
- Legacy `Date.UTC(2023,3,14)` → local Apr 13 under `America/Los_Angeles` → different BS than Apr 14 (intentional local-field behavior).
- No ISO date-string parsing in core converters (rejects string inputs).
- Formatter weekdays stable (Sukrabar for 2080-01-01) without `Date.getDay()`.

### Compared to prior step

| Metric | After ISS-019 | After Step 5 |
|--------|---------------|--------------|
| Jest | 131 | **150** |
| ISS-002 | open | **resolved** (date-only + documented legacy) |

---

## 2026-11-21 — Phase 1 Step 6: Algorithm assessment (no production changes)

### Command / environment

```bash
npm run build
node scripts/bench-conversion.mjs
```

Node **v24.15.0**, linux x64. Raw: `docs/progress/benchmarks-step6-raw.txt`. Report: `docs/progress/algorithm-assessment-step6.md`.

### Headline measurements (production)

| Workload | Result |
|----------|--------|
| Ad→Bs late (2099-end) median | **~1.26 ms** |
| Ad→Bs full range 36525 | **~22.9 s** (627 µs/op) |
| Bs→Ad full range 36525 | **~45 ms** (1.23 µs/op) |
| Ad→Bs latency vs daysFromRef | linear (0 → 18k → 36k days ≈ 0.1 → 631 → 1263 µs) |

### Prototype (script-only) vs prod

| Ad→Bs bulk 36525 | Time |
|------------------|------|
| prod day-walk | 22.9 s |
| prefix tables | 3.1 ms |
| full lookup | 2.9 ms |

Prefix init ~0.13 ms / ~5.6 KiB. Lookup ~4.3 ms / ~143 KiB. Prototypes matched prod on 500 random dates (0 failures).

### Recommendation recorded

Optimize AD→BS with prefix sums when authorized; keep BS→AD; **no src algorithm change in Step 6**.

---

## 2026-11-21 — Phase 1 Step 7: ISS-003 prefix AD→BS implemented

### Correctness

```bash
npx jest src/__tests__/conversion/ad-to-bs-prefix.test.ts --runInBand --coverage=false
# PASS 7 — includes exhaustive day-walk oracle parity 36525/36525 (~27s)
```

| TZ | Full suite |
|----|------------|
| UTC | **157/157** ~28s |
| Asia/Kathmandu | **157/157** ~27s |
| America/Los_Angeles | **157/157** ~27s |

`tsc --noEmit` PASS · `npm run build` PASS

### Performance (same harness as Step 6)

```bash
npm run build && node scripts/bench-conversion.mjs
```

| Workload | Step 6 (before) | Step 7 (after) |
|----------|-----------------|----------------|
| Ad→Bs late median | ~1,262 µs | **~0.15 µs** |
| Ad→Bs × 36,525 | ~22,908 ms | **~9.0 ms** |
| Ad→Bs late × 50k | ~63,169 ms | **~3.6 ms** |
| Ad→Bs distance sensitivity | linear in days | **flat** |
| Bs→Ad × 36,525 | ~45 ms | ~45 ms (unchanged) |
| Prefix table memory | — | **~5.6 KiB** (module init) |

Raw: `docs/progress/benchmarks-step7-raw.txt`

### Benchmark caveat (post-approval scrutiny)

`performance.now()` empty-delta median on the benchmark host ≈ **60–80 ns**. Sub-µs single-call medians are therefore **resolution-limited**. Re-check with result sink: late Ad→Bs batch ≈ **0.09–0.20 µs/op**; individually timed calls ≈ **~0.8 µs** median (timer overhead). **Bulk wall-clock** (~23 s → ~9 ms for 36,525) remains the reliable magnitude evidence. Do not over-claim precise sub-µs figures in user-facing docs.

---

## 2026-11-21 — Phase 2 architecture assessment (no code changes)

Inspection only. Deliverable: `docs/architecture/phase2-assessment.md`.

Verified: `NepaliDatePicker` imports from `../index` (cycle); UI reads `BS_CALENDAR_DATA` directly; core converters/utils/formatters have no DOM/React imports.

No Jest/build re-run required for assessment-only (Phase 1 suite remains the last green baseline: 157/157 × 3 TZ).

---

## 2026-11-21 — Phase 2 Stage 2.0: Public API inventory (ISS-017)

Assessment/documentation only — no production changes.

### Verification performed

- Inspected `src/index.ts` exports + `NepaliPatro` facade + `window.NepaliDatePicker` side effect
- Inspected `package.json` `main`/`module`/`types`/`exports`
- Confirmed built ESM keys via `import('./dist/nepali-patro-js.esm.js')`
- Confirmed `dist/nepali-patro-js.css` exists; `dist/only-styles.css` **missing**
- Confirmed UMD global name `NepaliPatro`; picker window assignment present
- Cross-checked README / QUICK_START import examples vs runtime (`formatBS` facade vs `formatBSDate` named; docs `ne` vs runtime `np`)

### Deliverable

`docs/api/public-api-inventory.md`

---

## 2026-11-21 — Phase 2 Stage 2.1: Break circular import (ISS-020)

### Change

`NepaliDatePicker.ts` no longer imports `../index`. Uses `converters/ad-to-bs`, `converters/bs-to-ad`, `formatters/date-formatter`, `types`.

### Commands

```bash
npm test -- --runInBand --coverage=false   # PASS 164/164 ~27s
npx tsc --noEmit                           # PASS
npm run build                              # PASS
```

Compat suite: `src/__tests__/public-api-compat.test.ts` (default/named facade, conversions, picker destroy, UMD globals, CSS path, cycle regression).

Public ESM export keys unchanged vs Stage 2.0 inventory.

---

## 2026-11-22 — Phase 2 Stage 2.2: Remove raw calendar data from datepicker (ISS-021)

### Change

`NepaliDatePicker` uses `getDaysInMonth` + `MIN_BS_YEAR`/`MAX_BS_YEAR`. No `BS_CALENDAR_DATA` reference.

### Commands

```bash
npm test -- --runInBand --coverage=false   # PASS 172/172 ~29s
npx tsc --noEmit                           # PASS
npm run build                              # PASS
```

Added UI tests: month lengths (2080-01=31, 2080-02=32), year-select span, Chaitra→Baisakh nav, out-of-range input, source ban on `BS_CALENDAR_DATA`.

---

## Prior: 2026-11-21 Phase 0 static checks

See earlier session notes: dataset 2000–2099 contiguous; packaging mismatches; no `node_modules` at that time.
