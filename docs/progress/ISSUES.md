# Issues and technical debt

Statuses: `open` | `in_progress` | `resolved` | `wontfix`  
Severity: `critical` | `high` | `medium` | `low`

---

## ISS-001 — `validateBsDate` uses wrong calendar-data index

- **Severity:** critical  
- **Module:** `src/utils/validations.ts` (+ tests)  
- **Status:** **resolved** (2026-11-21, Phase 1 Step 2)  
- **Description:** Used `BS_CALENDAR_DATA[year][month - 1]` but entries are `[days[], total]`. Invalid days were often accepted.  
- **Fix:** Read month length via `BS_CALENDAR_DATA[year][0][month - 1]`. Replaced legacy test that used the wrong index with independent regressions covering all 12 months in years 2000, 2078, 2080, 2081, 2099.  
- **Verification:** Focused validation suite + full Jest (63 passed) + `tsc --noEmit` + build; probes for (2080,2,33)/(2080,9,30)/(2080,1,32) now throw.  
- **Related:** Phase 1 Step 2; ADR-003

## ISS-002 — Timezone-dependent calendar arithmetic

- **Severity:** high  
- **Module:** converters, `REF_AD`, `getCurrentBSDate`, formatter weekday  
- **Status:** **resolved** (Phase 1 Step 5, 2026-11-21) — date-only path TZ-safe; legacy `Date` path intentionally local-field  
- **Description:** Local `Date` constructors/getters made conversion/weekday sensitive to host TZ.  
- **Fix:** Introduced `CalendarDate` / `REF_AD_YMD`, pure Gregorian day-number arithmetic, `convertAdToBs` / `convertBsToAd`, weekday via day index. Legacy APIs keep local getters/construction (ADR-002). TZ matrix: UTC, Asia/Kathmandu, America/Los_Angeles.  
- **Remaining by design:** `convertADToBS(Date)`, returned `Date` from `convertBSToAD`, and `getCurrentBSDate()` remain timezone-sensitive. Explicit UTC Date API not added (propose before implement).  

## ISS-003 — AD→BS O(days) walk

- **Severity:** medium  
- **Module:** `converters/date-only.ts` (`convertAdToBs`), `converters/bs-prefix.ts`  
- **Status:** **resolved** (Phase 1 Step 7, 2026-11-21)  
- **Description:** Day-by-day iteration from REF was O(|daysFromRef|) (~1.3 ms late; ~23 s for 36,525).  
- **Fix:** Internal year/month prefix tables from `BS_CALENDAR_DATA` + binary year search (`bsDateFromDayIndex`). BS→AD / `daysBetweenBS` unchanged.  
- **Verification:** Exhaustive parity vs day-walk oracle 36525/36525; goldens; round-trips; TZ matrix UTC/Kathmandu/LA 157/157; bulk Ad→Bs ~9 ms (was ~22.9 s).  
- **Related:** [algorithm-assessment-step6.md](./algorithm-assessment-step6.md); Step 7 benches `benchmarks-step7-raw.txt`  

## ISS-004 — No explicit max AD bound tied to BS 2099 end

- **Severity:** medium  
- **Module:** `validateAdDate`  
- **Status:** open  
- **Description:** Only minimum AD year checked; upper bound implicit via BS walk errors.  

## ISS-005 — Locale `ne` vs `np` inconsistency

- **Severity:** high  
- **Module:** types, formatter, README, QUICK_START, datepicker  
- **Status:** open — **docs corrected 2026-11-22 (Stage 4.1)**; runtime still uses `'np'` only  
- **Description:** Types and runtime treat locale as `'en' | 'np'`. Historical docs used `'ne'`. Passing `language: 'ne'` to `formatBS` does **not** enable Nepali digits (`useNepaliDigits` is `language === 'np'`); month/weekday names take the non-`en` branch, which is accidental and unsupported.  
- **Docs (4.1):** README / QUICK_START / formatting API now document `'np'` and warn against `'ne'`.  
- **Proposed code change (not authorized in 4.1):** Canonical BCP-47 `ne` with `np` alias (ADR-005).  

## ISS-006 — Format token replace corrupts month/weekday names

- **Severity:** critical  
- **Module:** `date-formatter.ts`  
- **Status:** **resolved** (2026-11-21, Phase 1 Step 3)  
- **Description:** Sequential global `.replace(/M/g)` / `.replace(/d/g)` rewrote letters inside already-substituted names (Mangsir → `8angsir`, Magh → `10agh`, Budhabar → `Bu4habar`).  
- **Fix:** Single-pass longest-first tokenization (`YYYY|YY|MMMM|…|d`) with optional `[literal]` escapes; values substituted once, never rescanned.  
- **Verification:** Formatter suite + full Jest **96/96**; probes show correct Mangsir/Magh/Budhabar.  

## ISS-007 — Ambiguous DD-MM vs MM-DD parse patterns

- **Severity:** medium  
- **Module:** `helpers.getDateFormatPatterns`, datepicker parser  
- **Status:** open  
- **Description:** Two patterns share identical regex; order decides interpretation.  

## ISS-008 — Missing TypeScript declaration files

- **Severity:** high  
- **Module:** packaging / Rollup  
- **Status:** open (partially mitigated)  
- **Description:** After `npm run build` (2026-11-21), `dist/index.d.ts` **is** emitted by the TS plugin. `rollup-plugin-dts` remains unused. `.gitignore` still excludes most of `dist/` except umd/esm/css — local git may not track declarations. Publish via `prepublishOnly` may include them if present at pack time — needs pack smoke test (Phase 5).  

## ISS-009 — Broken `./styles` CSS export

- **Severity:** high  
- **Module:** `package.json` exports  
- **Status:** open  
- **Description:** Points to `dist/only-styles.css` which is not built; `./css` correctly points to `nepali-patro-js.css`.  

## ISS-010 — CI continue-on-error on build and test

- **Severity:** high  
- **Module:** `.github/workflows/ci.yml`  
- **Status:** open  
- **Description:** Failed build/test do not fail the workflow.  

## ISS-011 — Circular dependency index ↔ NepaliDatePicker

- **Severity:** high  
- **Module:** `src/index.ts`, `src/ui/NepaliDatePicker.ts`  
- **Status:** **duplicate of ISS-020** — track Stage 2.1 under ISS-020  
- **Proposed:** Datepicker imports core/i18n directly (never barrel).  

## ISS-012 — Datepicker full-DOM z-index scan

- **Severity:** medium  
- **Module:** datepicker positioning  
- **Status:** **resolved** (Phase 3 Stage 3.4, 2026-11-22)  
- **Description:** `querySelectorAll('*')` + getComputedStyle on open — expensive and fragile.  
- **Fix:** `src/ui/position.ts` — deterministic `DEFAULT_POPUP_Z_INDEX` / constructor `zIndex` / `setZIndex()` precedence; no document-wide scan; body-attached absolute positioning with scroll/resize recalculation.  
- **Related:** ADR-004; Stage 3.4  

## ISS-013 — Datepicker accessibility / feature gaps

- **Severity:** medium  
- **Module:** UI  
- **Status:** **partial / open** — Stage 4.3 keyboard + ARIA-DOM verified; **screen-reader speech still NOT TESTED**  
- **Description:** Phase 3 delivered keyboard/ARIA under jsdom. Stage 4.3 (2026-11-22) confirmed keyboard/focus/ARIA scaffolding in Chromium-based IDE browser. NVDA / VoiceOver / Orca **speech** not verified. Contrast defects filed as ISS-026/027. Deferred: full AD grid / mode switch.  
- **Done:** Keyboard nav, dialog/grid ARIA, live month, disabled/today/selected attributes, EN/NP labels (DOM).  
- **Still required for stronger claim:** Human SR session (NVDA or VoiceOver recommended); contrast fixes; optional markup review for `aria-selected` placement.  
- **Do not** claim WCAG conformance.  
- **Related:** [phase4-accessibility-results.md](../architecture/phase4-accessibility-results.md)  

## ISS-024 — AD footer tracks focus, not mouse hover

- **Severity:** low (documented behavior)  
- **Module:** datepicker AD footer  
- **Status:** **accepted limitation** (Stage 3.7 preflight, 2026-11-22)  
- **Clarification:** Footer syncs on keyboard focus moves, month navigation re-renders, Clear (focused unchanged), and is removed when Today/selection closes the popup. Mouse **hover** does not update the footer; mouse **click** on a day selects and closes.  
- **Not a silent Stage 3.7 fix:** no functional change folded into visual work.  
- **Verification:** `ad-footer-sync.test.ts`  
- **Stage 4.2:** Confirmed in real browser — footer unchanged on `mouseover`.

## ISS-025 — Nested scroll containers do not reposition the popup

- **Severity:** medium  
- **Module:** `ui/NepaliDatePicker.ts` positioning listeners / `ui/position.ts`  
- **Status:** **resolved** (maintainer approved close, 2026-11-22)  
- **Evidence (pre-fix):** Fixture nested `overflow:auto` scrolled while popup open; popup `top` unchanged.  
- **Cause:** `window.addEventListener('scroll', …, true)` never sees element scroller events (they do not propagate to `window`).  
- **Fix:** `collectScrollableAncestors()`; attach/detach passive `scroll` on those nodes while open (with existing window scroll/resize + rAF coalesce).  
- **Verification:** Jest positioning regressions; IDE Chromium smoke on `smoke-phase42.html` nested scroller (`style.top` updated after ancestor scroll). Browser coverage limited (not full cross-browser positioning cert); accepted for this scoped issue.  
- **Related:** [phase4-browser-smoke-results.md](../architecture/phase4-browser-smoke-results.md)

## ISS-026 — Low contrast AD subtitle (light theme)

- **Severity:** high (visual readability)  
- **Module:** `ui/styles.css` (`.nepali-day-ad`)  
- **Status:** **resolved** (Stage 4.4, 2026-11-22)  
- **Fix:** Dedicated `--np-ad-text` (`#4a5568` light / `#cbd5e0` dark); `--np-ad-opacity: 1` (no opacity dimming for primary AD subtitles).  
- **After measure (IDE Chromium):** current-month AD contrast ≈ **7.53:1** light / **10.98:1** dark (approx. sRGB).  
- **Note:** Other-month AD still uses `--np-text-subtle` (intentionally quieter). Not a WCAG certification claim.  
- **Related:** Stage 4.4; [phase4-accessibility-results.md](../architecture/phase4-accessibility-results.md)

## ISS-027 — Selected day text contrast (light theme)

- **Severity:** medium–high  
- **Module:** `ui/styles.css` (`--np-selected-bg` / `--np-selected-text`)  
- **Status:** **resolved** (Stage 4.4, 2026-11-22)  
- **Fix:** `--np-selected-bg: #2b6cb0`; hover `#2c5282` (light + dark). Border via `--np-accent-strong` retained (not color-alone).  
- **After measure:** white on selected ≈ **5.42:1** (light and dark).  
- **Related:** Stage 4.4

## ISS-023 — Constraint option mutability semantics (Stage 3.5 clarification)

- **Severity:** low (docs / API clarity)  
- **Module:** `ui/constraints.ts`, `NepaliDatePickerOptions`  
- **Status:** **resolved** (2026-11-22) — behavior confirmed + regression tests  
- **Clarification:**
  - `minDate` / `maxDate` / `disabledDates` are **snapshotted** at construction (copied triples; `disabledDates` is a new array). Mutating the caller's array or objects afterward does **not** affect the picker.
  - `isDateDisabled` is kept by **reference** and evaluated **dynamically** on every availability check.
- **Not in scope:** a runtime constraint-mutation API (`setMinDate`, etc.).  
- **Verification:** pure + UI regression tests in `constraints.test.ts` / `constraints-ui.test.ts`.  

## ISS-014 — Unsafe / brittle HTML rendering

- **Severity:** medium  
- **Module:** datepicker rendering  
- **Status:** **resolved** (Phase 3 Stage 3.2, 2026-11-22)  
- **Description:** Calendar popup built via `innerHTML` string interpolation.  
- **Fix:** `src/ui/render.ts` builds the tree with `createElement` / `createTextNode` / `textContent`; orchestrator attaches listeners only. Security regressions assert malicious-looking labels stay text.  
- **Related:** ADR-004; Stage 3.2  

## ISS-022 — Datepicker `destroy()` leaves input click listener

- **Severity:** high  
- **Module:** `src/ui/NepaliDatePicker.ts`  
- **Status:** **resolved** (Phase 3 Stage 3.1, 2026-11-22)  
- **Description:** `destroy()` removed document outside-click handler and registry entry but not the input `click` listener.  
- **Fix:** Track `onInputClick` / `onDocumentClick`; remove both on destroy; `destroyed` state blocks open; repeated destroy is safe.  
- **Verification:** UI destroy regressions + full Jest.  
- **Related:** [phase3-datepicker-assessment.md](../architecture/phase3-datepicker-assessment.md)  

## ISS-015 — Weak / absent baseline verification in this workspace

- **Severity:** low (process)  
- **Status:** **resolved** (baseline captured 2026-11-21)  
- **Description:** Phase 0 lacked `node_modules`. Phase 1 Step 1 ran `npm ci`, `npm test`, `npm run build`, `npx tsc --noEmit` and recorded results in TEST-RESULTS.md.  
- **Note:** Green Jest is insufficient; ISS-001/006 confirmed outside the suite.  

## ISS-016 — Calendar dataset provenance unknown

- **Severity:** medium (documentation / trust)  
- **Module:** `src/core/calendar-data.ts` (formerly under `constants/`), consumer docs  
- **Status:** open — **still unresolved**; Stage 4.1 documented honesty in README / QUICK_START (2026-11-22)  
- **Description:** No authoritative source citation in repo comments, README, or git history. Table introduced in commit `a6f54aa` (“add converters…”) with no upstream attribution.  
- **Evidence available today:**
  - Contiguous BS **2000–2099** month lengths; year totals match sum of months
  - SHA-256 pin of serialized table (see core-engine docs)
  - Golden AD↔BS fixtures + exhaustive round-trips (**36525/36525**) prove **internal consistency**
  - Date-only conversions identical under multiple timezones
- **Not established:** Independent historical verification against a cited civil authority; authorship of the month table.  
- **External disagreement sample (investigated 2026-11-21):** e.g. merokalam lists 2078-01-01 BS = 2021-04-13 AD while dataset+REF imply 2021-04-14 — treat as a risk signal, not a verdict on which source is “correct.”  
- **Consumer messaging (Stage 4.1):** Explicit “provenance unknown”; round-trips ≠ historical proof; do not market as an authoritative almanac.  
- **Proposed next (not 4.1):** Seek author/upstream table; design a validation process against named references; **do not replace dataset** without ADR-003 approval.  
- **Related:** ADR-003; [phase4-hardening-assessment.md](../architecture/phase4-hardening-assessment.md)  

## ISS-019 — `daysBetweenBS` incorrect day count (BS → AD broken for many dates)

- **Severity:** critical  
- **Module:** `src/converters/bs-to-ad.ts` (`daysBetweenBS`)  
- **Status:** **resolved** — fixed 2026-11-21 (authorized after Step 4)  
- **Description:** BS→AD often returned ~+30 days (e.g. 2080-01-01 → 2023-05-15 instead of 2023-04-14).  
- **Root cause (verified):** The old cursor loop (1) used same-month formula `(len − d1) + d2` (over-counts by one full month when spans start after day 1 / when used from REF), and (2) on month-12→1 rollover incremented the year, reset to month 1, then **added the entire next Baisakh** before adding `date2.day`.  
- **Fix:** Replace cursor arithmetic with absolute day indices from `REF_BS`: sum complete years + complete months + `(day − REF_BS.day)`; `daysBetweenBS(a,b) = index(b) − index(a)`. Dataset and REF unchanged.  
- **Evidence after fix:** Exhaustive BS→AD→BS **36525 / 36525** zero failures (~25–31s). All golden BS→AD fixtures pass. Formatter weekday expectations updated from the old May-15 encoding to 2023-04-14.  
- **Related:** ADR-002/003; Step 4 goldens/round-trips  

## ISS-017 — Complete v1 public API inventory before removals

- **Severity:** medium (process / compatibility)
- **Module:** public exports, migration guide
- **Status:** **resolved** (inventory frozen for Stage 2.1 planning — 2026-11-21)
- **Description:** ADR-005 requires a frozen, documented inventory of the v1 public API before any export is removed.
- **Deliverable:** [docs/api/public-api-inventory.md](../api/public-api-inventory.md) — entry points, exports, facade, picker, CSS, UMD, compatibility classes, Stage 2.1 test plan, open ambiguities.
- **Note:** Inventory does not authorize removals; ambiguities (e.g. `returnType`, docs `ne` vs runtime `np`) need separate decisions.
- **Clarification (2026-11-22):** ISS-017 remains **resolved** as the public API inventory freeze. Stage 2.5 boundary enforcement is **ISS-018 only** — do not reopen ISS-017 for architecture lint/tests.
- **Related:** ADR-005; Stage 2.0

## ISS-018 — Module boundary enforcement not yet automated

- **Severity:** medium
- **Module:** tooling / Phase 2
- **Status:** **resolved** (Stage 2.5, 2026-11-22)
- **Description:** ADR-001 requires automated checks so `core` cannot import DOM/React/datepicker/i18n, etc.
- **Fix:** Jest enforcement module `src/__tests__/architecture/boundary-enforcement.ts` + `boundaries.test.ts` — scans static/`import()`/`require` edges, DOM globals, cycles, facade dataset privacy, package `./core` ban. Includes **negative** fixtures proving violations are detected. Docs: [boundary-rules.md](../architecture/boundary-rules.md).
- **Follow-up:** Ownership moves completed in Stage 2.6 ([exceptions-stage25.md](../architecture/exceptions-stage25.md)).
- **Related:** ADR-001; Stage 2.5–2.6

## Stage 2.6 note — ownership cleanup (no new ISS)

- **Status:** completed 2026-11-22
- **Change:** `NEPALI_DIGITS` → `i18n/digits.ts`; locale enums → `i18n/names.ts`; `DateFormatPattern` / `NepaliPatroOptions` → `i18n/types.ts`; `NepaliDatePickerOptions` → `ui/types.ts`. Facade re-exports preserve public names.
- **Related:** Stage 2.5 exceptions; ADR-001

## ISS-020 — Circular dependency `index` ↔ `NepaliDatePicker`

- **Severity:** high  
- **Module:** `src/index.ts`, `src/ui/NepaliDatePicker.ts`  
- **Status:** **resolved** (Phase 2 Stage 2.1, 2026-11-21)  
- **Description:** Datepicker imported conversion/format/types from `../index` while `index` imported and exported the picker.  
- **Fix:** `NepaliDatePicker.ts` now imports from `converters/*`, `formatters/date-formatter`, and `types` directly. Barrel still re-exports picker for public API. No export list changes.  
- **Verification:** Compat tests + full Jest 164/164; tsc; build; cycle regression asserts no `from '../index'`.  
- **Related:** ADR-001; Stage 2.1; ISS-011 kept separate  

## ISS-021 — Datepicker reads `BS_CALENDAR_DATA` directly

- **Severity:** high  
- **Module:** `src/ui/NepaliDatePicker.ts`  
- **Status:** **resolved** (Phase 2 Stage 2.2, 2026-11-22)  
- **Description:** UI bypassed `getDaysInMonth` / validation and duplicated month-length lookup from the dataset.  
- **Fix:** Uses `getDaysInMonth` + `MIN_BS_YEAR`/`MAX_BS_YEAR` only. No `BS_CALENDAR_DATA` import/reference. Private `daysInBsMonth` wraps core API with safe fallback for padding outside range.  
- **Verification:** Regression asserts no `BS_CALENDAR_DATA` in datepicker source; month-length UI tests; full Jest; tsc; build.  
- **Related:** ADR-001/004; Stage 2.2  
- **Follow-up:** Stage 2.3 clarified `daysInBsMonth` fallback is a numeric constant (`30`) for adjacent-month grid padding only — no calendar-data access and no duplicate month-length arithmetic. Stage 2.4 tightened the catch so only out-of-range years use the fallback; supported-year core errors are rethrown. Documented + tested.

## Stage 2.3 note — helpers split (no new ISS)

- **Status:** completed 2026-11-22 (internal refactor; no behavioral change)
- **Change:** Core helpers → `src/utils/calendar.ts`; i18n helpers → `src/utils/localization.ts`; `helpers.ts` retained as re-export shim (removed in Stage 2.4 after migration).
- **Related:** phase2-assessment V3; ADR-001

## Stage 2.4 note — physical core / i18n layout (no new ISS)

- **Status:** completed 2026-11-22 (directory restructure; no public API / algorithm change)
- **Change:** Production modules under `src/core/` and `src/i18n/`; `ui/` unchanged; `helpers.ts` removed.
- **Related:** ADR-001; Stage 2.4
