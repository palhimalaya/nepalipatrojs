# Phase 2 — Architecture & module boundaries assessment

**Date:** 2026-11-21  
**Authorization:** Assessment only — **no production source changes**  
**ADRs:** 001–005 Accepted (preserved; no amendments proposed)

## 1. Current module inventory (verified)

| Path | Responsibility |
|------|----------------|
| `src/types/` | `CalendarDate`, `NepaliDate`/`BsDate`/`AdDate`, month/weekday enums, options |
| `src/constants/calendar-data.ts` | `BS_CALENDAR_DATA`, REF epoch, digits, range constants |
| `src/utils/gregorian.ts` | Pure Gregorian day arithmetic |
| `src/utils/validations.ts` | BS/AD throw-on-invalid |
| `src/utils/calendar.ts` | Core: `getDaysInMonth`, `parseDateInput` (Stage 2.3) |
| `src/utils/localization.ts` | i18n: `localizeDigits`, `localizeMonth`, `nepaliDigitsToEnglish`, `getDateFormatPatterns` (Stage 2.3) |
| `src/utils/helpers.ts` | Re-export shim only (Stage 2.3; kept for compat) |
| `src/converters/date-only.ts` | Date-only AD↔BS + weekday indices |
| `src/converters/bs-prefix.ts` | Internal AD→BS prefix tables (ISS-003) |
| `src/converters/bs-day-index.ts` | BS absolute day index (ISS-019) |
| `src/converters/ad-to-bs.ts` / `bs-to-ad.ts` | Legacy `Date` / array wrappers |
| `src/formatters/date-formatter.ts` | `formatBS`, `toNepaliDigits` |
| `src/ui/NepaliDatePicker.ts` | Monolithic vanilla datepicker (~645 lines) |
| `src/ui/styles.css` | Datepicker styles |
| `src/index.ts` | Public barrel + `NepaliPatro` facade + `window.NepaliDatePicker` |
| `src/only-css.js` | CSS-only Rollup entry |

Core conversion/format/utils: **no React**; **no DOM** (verified by search). DOM/`window` appear only in `ui/` and the browser attachment in `index.ts`.

## 2. Actual dependency graph

```
types ◄── constants/calendar-data
types ◄── utils/gregorian, validations, helpers
constants ◄── validations, helpers, bs-day-index, bs-prefix, formatters, ui

utils/gregorian ◄── validations, date-only
utils/helpers   ◄── bs-day-index, bs-to-ad, ui, (public via index)
utils/validations ◄── date-only

bs-prefix ◄── date-only
bs-day-index ◄── date-only, (re-export via bs-to-ad)
date-only ◄── ad-to-bs, bs-to-ad, formatters

ad-to-bs / bs-to-ad / formatters / helpers / date-only ◄── index
index ◄── ui/NepaliDatePicker          ★ CIRCULAR
ui ──► index (getCurrentBSDate, convertBSToAD, formatBSDate, types)
ui ──► constants (BS_CALENDAR_DATA direct)
ui ──► helpers (localize*, patterns)
```

### Cycles (confirmed)

```
src/index.ts  ←→  src/ui/NepaliDatePicker.ts
```

`NepaliDatePicker` imports conversion/format/types from `../index` while `index` imports and re-exports the picker. This is the primary ADR-001 violation still present.

No other production cycles found among converters/utils/formatters.

## 3. ADR alignment

| ADR | Intent | Current status |
|-----|--------|----------------|
| **001** Single package; core free of DOM/React; UI consumes core; boundary enforcement | Core files are DOM-free; **cycle UI↔index**; **no boundary lint/tests** (ISS-018); datepicker still reaches into `BS_CALENDAR_DATA` | Partial |
| **002** Date-only core; legacy Date local semantics | Implemented in Phase 1 | Met |
| **003** Preserve dataset/REF; honesty on provenance | Dataset unchanged; ISS-016 still open | Met (provenance open) |
| **004** Modular accessible datepicker | Still one class; Phase 3 work | Not started |
| **005** Public API inventory; `ne`/`np`; pack/types | Inventory incomplete (ISS-017); locale still `np`; packaging gaps remain | Partial |

**No ADR amendments proposed.** Evidence supports executing ADR-001/004/005, not changing them.

## 4. Architecture violations & smells

| ID | Severity | Finding |
|----|----------|---------|
| V1 | **High** | Circular dependency `index` ↔ `NepaliDatePicker` |
| V2 | **High** | Datepicker reads `BS_CALENDAR_DATA` directly (duplicates `getDaysInMonth` / bypasses validation helpers) |
| V3 | **Medium** | ~~`helpers.ts` mixes core calendar, i18n, and parse-pattern concerns~~ **Resolved Stage 2.3** |
| V4 | **Medium** | Datepicker monolithic: state, parse, HTML string render, position, z-index DOM scan, locale |
| V5 | **Medium** | Packaging: `exports["./styles"]` → missing `only-styles.css`; CI `continue-on-error`; types story historically broken (note: build currently emits `dist/index.d.ts` — verify publish/`files`/gitignore still align) |
| V6 | **Low** | `index.ts` attaches `window.NepaliDatePicker` (acceptable for UMD, but couples barrel to browser) |
| V7 | **Low** | Converter folder sprawl (`date-only`, `bs-prefix`, `bs-day-index`, wrappers) — workable but not yet a clear `core/` package |

**Not violations:** Core importing DOM/React (it does not). React required for vanilla (it is not).

## 5. Datepicker internal split (assessment only)

| Concern today | Target module (ADR-004) |
|---------------|-------------------------|
| Instance fields / open state | `datepicker/state` |
| Input parsing / patterns | `datepicker/parse` (+ shared format patterns from i18n or core) |
| Month grid model | `datepicker/calendar-view` (pure; uses **core** `getDaysInMonth` / converters) |
| DOM render | `datepicker/calendar-view/render` (`createElement`, not `innerHTML`) |
| Placement / z-index | `datepicker/positioning` (no `querySelectorAll('*')`) |
| a11y | `datepicker/a11y` |
| Styles | `datepicker/styles` |
| Orchestrator | thin `NepaliDatePicker.ts` |

## 6. Proposed target structure (unchanged ADR-001 shape)

```
src/
  core/
    calendar-data.ts
    types.ts
    gregorian.ts
    validation/
    converters/          # date-only + legacy wrappers + prefix/day-index
    index.ts             # core public surface (no DOM)
  i18n/
    digits.ts
    months.ts
    format.ts            # formatBS
    patterns.ts          # getDateFormatPatterns
  datepicker/
    …modular pieces…
    NepaliDatePicker.ts  # imports from core/ + i18n/, NEVER from src/index
  index.ts               # compatibility barrel: re-export core + i18n + datepicker
  # react/ later (Phase 4) — optional export path
```

### Current → target mapping

| Current | Target |
|---------|--------|
| `types/`, `constants/` | `core/types`, `core/calendar-data` |
| `utils/gregorian`, `validations` | `core/` |
| `utils/helpers` getDaysInMonth / parseDateInput | `core/` |
| `utils/helpers` localize* / patterns | `i18n/` |
| `converters/*` | `core/converters/` |
| `formatters/*` | `i18n/format.ts` |
| `ui/NepaliDatePicker.ts` | `datepicker/` modules |
| `ui/styles.css` | `datepicker/styles/` |
| `index.ts` | thin barrel only |

## 7. Recommended refactoring sequence

Do **not** big-bang move. Keep public imports working via barrel throughout.

| Stage | Change | Depends on | Tests |
|-------|--------|------------|-------|
| **2.0** | Freeze/complete v1 API inventory (ISS-017) in docs | — | Doc review only |
| **2.1** | Break cycle: datepicker imports `core`/`i18n` (or deep paths) instead of `../index`; barrel still re-exports picker | 2.0 | Datepicker + index + full Jest |
| **2.2** | Datepicker uses `getDaysInMonth` / public converters only — stop raw `BS_CALENDAR_DATA` reads | 2.1 | Datepicker + conversion |
| **2.3** | Split `helpers.ts` into core vs i18n files (re-export shims if needed) | 2.1 | Unit + full suite |
| **2.4** | Physical `src/core/` + `src/i18n/` folders; barrel compatibility | 2.3 | Full suite + build + typecheck |
| **2.5** | Architecture test/lint: core must not import `datepicker`/`react`/DOM (ISS-018) | 2.4 | New arch tests in CI |
| **2.6** | Packaging alignment (types publish, CSS export, CI fail-closed) — may overlap Phase 5 | 2.4 | pack smoke |
| **3.x** | Datepicker modularization / redesign | Phase 3 auth | Datepicker suite |

Stages **2.1–2.2** give the highest safety ROI (cycle + calendar ownership) before any large directory moves.

## 8. Risk assessment

| Risk | Mitigation |
|------|------------|
| Public API breakage | Keep `src/index.ts` as compatibility barrel; no renames without ADR-005 deprecation |
| Circular-fix regressions | Stage 2.1 first; smoke UMD global + named imports |
| Accidental dataset/behavior change | No calendar edits; conversion goldens + 36525 round-trips after each stage |
| Over-splitting datepicker early | Defer ADR-004 module split to Phase 3; Phase 2 only fixes boundaries |
| Packaging churn mid-move | Prefer 2.6 after folder moves stabilize |

## 9. Decisions requiring further approval

1. Whether Stage **2.6 packaging** stays in Phase 2 or waits for Phase 5.
2. Exact public export map (`nepalipatrojs/core` deep import vs barrel-only) — ADR-001 allows export boundaries; choose before implementing 2.4.
3. When to start Phase 3 datepicker redesign vs finishing 2.1–2.5 only.
4. Any public rename (`formatBSDate` vs `formatBS`) — not recommended now.

**Not requested:** ADR changes, React work, dataset changes, API removals.

## 10. Step 7 performance caveat (documentation)

Correctness of ISS-003 is accepted. Published microsecond figures need care:

- `performance.now()` empty delta on this host is ~**60–80 ns** median — single-call timings near ~0.1 µs are **timer-resolution limited**.
- Re-check with result sink (batch 50k late Ad→Bs): ~**0.09–0.20 µs/op** average; single-call median ~**0.8 µs** when each call is timed individually (timer overhead).
- **Directional claim remains valid:** bulk 36,525 Ad→Bs went from ~**23 s** (day-walk) to ~**9 ms** (prefix) — orders of magnitude, not noise.
- Treat precise sub-microsecond medians as approximate; prefer bulk/wall-clock comparisons in public docs.

## 11. Completion

This assessment is complete. **No refactoring started.**  
Next implementation requires separate authorization, preferably beginning with **Stage 2.1 (break index↔datepicker cycle)**.
