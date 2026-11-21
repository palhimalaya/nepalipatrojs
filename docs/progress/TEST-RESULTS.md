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

## Prior: 2026-11-21 Phase 0 static checks

See earlier session notes: dataset 2000–2099 contiguous; packaging mismatches; no `node_modules` at that time.
