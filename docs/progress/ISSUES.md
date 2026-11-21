# Issues and technical debt

Statuses: `open` | `in_progress` | `resolved` | `wontfix`  
Severity: `critical` | `high` | `medium` | `low`

---

## ISS-001 — `validateBsDate` uses wrong calendar-data index

- **Severity:** critical  
- **Module:** `src/utils/validations.ts` (+ tests)  
- **Status:** open  
- **Description:** Uses `BS_CALENDAR_DATA[year][month - 1]` but entries are `[days[], total]`. Month 1 yields an **array**; month 2 yields **year total** (365/366), not Jestha length.  
- **Reproduction:** Compare `getDaysInMonth(2080, 2)` (32) vs wrong index path (365). Valid days in short months may not throw; invalid days may be accepted.  
- **Root cause:** Incorrect tuple indexing; tests copy the same mistake (`validations.test.ts` line using `[year][month-1]`).  
- **Proposed:** Use `[year][0][month-1]`; fix tests; add explicit case for month 2 / last day+1.  
- **Related:** Phase 1; ADR-003

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
- **Status:** open  
- **Description:** After expanding `MMMM`/`dddd`, `/M/g` and `/d/g` replace letters inside names (`Mangsir` → `8angsir`, `Budhabar` → `Bu4habar`). Tests use Baisakh only.  
- **Proposed:** Tokenize pattern; substitute placeholders; regression tests.  

## ISS-007 — Ambiguous DD-MM vs MM-DD parse patterns

- **Severity:** medium  
- **Module:** `helpers.getDateFormatPatterns`, datepicker parser  
- **Status:** open  
- **Description:** Two patterns share identical regex; order decides interpretation.  

## ISS-008 — Missing TypeScript declaration files

- **Severity:** high  
- **Module:** packaging / Rollup  
- **Status:** open  
- **Description:** `package.json` `types` → `dist/index.d.ts` but no `.d.ts` in dist; `rollup-plugin-dts` unused; gitignore would drop them.  

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
- **Status:** open  
- **Description:** Phase 0 could not run Jest (`node_modules` missing). Baseline must be captured at Phase 1 start.  

## ISS-016 — Calendar dataset provenance unknown

- **Severity:** medium (documentation / trust)  
- **Module:** `src/constants/calendar-data.ts`, docs  
- **Status:** open  
- **Description:** No authoritative source citation found in the repository for `BS_CALENDAR_DATA`. Integrity can be checksummed and structurally tested, but historical accuracy is not independently proven.  
- **Proposed:** Document “provenance unknown”; search git/history/upstream later; never invent a source. Add checksum tests (ADR-003).  
- **Related:** ADR-003  

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
