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
- **Module:** converters, `REF_AD`, `getCurrentBSDate`, formatter weekday via `Date`  
- **Status:** open  
- **Description:** Local `Date` constructors/getters and `setDate` can shift civil days across zones.  
- **Proposed:** Date-only model (ADR-002); timezone matrix tests.  

## ISS-003 — AD→BS O(days) walk

- **Severity:** medium  
- **Module:** `ad-to-bs.ts`  
- **Status:** open  
- **Description:** Day-by-day iteration from reference; correct but slow for far dates.  
- **Proposed:** Optimize only after golden tests (prefix day counts).  

## ISS-004 — No explicit max AD bound tied to BS 2099 end

- **Severity:** medium  
- **Module:** `validateAdDate`  
- **Status:** open  
- **Description:** Only minimum AD year checked; upper bound implicit via BS walk errors.  

## ISS-005 — Locale `ne` vs `np` inconsistency

- **Severity:** high  
- **Module:** types, formatter, README, QUICK_START  
- **Status:** open  
- **Description:** Runtime expects `np`; docs show `ne` for formatting.  
- **Proposed:** Canonical `ne`, alias `np` (ADR-005).  

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
- **Status:** open  
- **Proposed:** Datepicker imports core/i18n directly (Phase 2).  

## ISS-012 — Datepicker full-DOM z-index scan

- **Severity:** medium  
- **Module:** `NepaliDatePicker.getHighestZIndex`  
- **Status:** open  
- **Description:** `querySelectorAll('*')` + getComputedStyle on open — expensive and fragile.  

## ISS-013 — Datepicker feature gaps

- **Severity:** medium  
- **Module:** UI  
- **Status:** open  
- **Description:** No min/max/disabled, dual calendar, keyboard/ARIA depth, today/clear, Escape.  

## ISS-014 — Unsafe / brittle HTML rendering

- **Severity:** medium  
- **Module:** datepicker `innerHTML` templates  
- **Status:** open  
- **Proposed:** DOM APIs + escaping (Phase 3).  

## ISS-015 — Weak / absent baseline verification in this workspace

- **Severity:** low (process)  
- **Status:** **resolved** (baseline captured 2026-11-21)  
- **Description:** Phase 0 lacked `node_modules`. Phase 1 Step 1 ran `npm ci`, `npm test`, `npm run build`, `npx tsc --noEmit` and recorded results in TEST-RESULTS.md.  
- **Note:** Green Jest is insufficient; ISS-001/006 confirmed outside the suite.  

## ISS-016 — Calendar dataset provenance unknown

- **Severity:** medium (documentation / trust)  
- **Module:** `src/constants/calendar-data.ts`, docs  
- **Status:** open — **investigated 2026-11-21, still unresolved**  
- **Description:** No authoritative source citation in repo comments, README, or git history. `calendar-data.ts` introduced in commit `a6f54aa` (“add converters…”) with no upstream attribution.  
- **Findings:** Structural integrity + SHA-256 pin added. Some public tables disagree by one day on certain New Years (e.g. merokalam 2078-01-01 = 2021-04-13 vs dataset+REF ⇒ 2021-04-14). Round-trips ≠ historical proof.  
- **Proposed:** Keep “provenance unknown”; seek author/upstream table; do not replace dataset without ADR-003 approval.  
- **Related:** ADR-003  

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
- **Status:** open  
- **Description:** ADR-005 requires a frozen, documented inventory of the v1 public API before any export is removed. Partial inventory exists in architecture/system-overview.md; needs completion and migration-guide linkage.  
- **Related:** ADR-005  

## ISS-018 — Module boundary enforcement not yet automated

- **Severity:** medium  
- **Module:** tooling / Phase 2  
- **Status:** open  
- **Description:** ADR-001 requires lint or architecture tests so `core` cannot import DOM/React/datepicker. Not implemented.  
- **Related:** ADR-001  
