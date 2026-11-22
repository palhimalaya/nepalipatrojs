# Changelog (engineering)

User-facing npm release notes will also live in the root `CHANGELOG` when 2.0 ships. This file tracks modernization milestones.

## Unreleased — 2.0 modernization

### Added

- Phase 0 documentation tree under `docs/`
- `PROJECT_CONTEXT.md` for session handoff
- Progress tracking: MASTER-PLAN, STATUS, ISSUES, DECISIONS, TEST-RESULTS, session logs
- ADRs 001–005 (**Accepted** 2026-11-21)
- Issues ISS-016 (dataset provenance), ISS-017 (v1 API inventory), ISS-018 (boundary enforcement)

### Changed

- `.gitignore`: allow tracking `docs/progress/logs/`
- ADR-002 amended: legacy `Date` keeps local-field semantics; UTC only via explicit API
- ADR-003 amended: provenance, checksum, structural/golden/round-trip requirements; accuracy caveat
- ADR-005 amended: v1 inventory freeze, deprecation policy, pack-install tests

### Fixed

- **ISS-001:** `validateBsDate` now reads month lengths from `BS_CALENDAR_DATA[year][0][month - 1]` (was wrong tuple index). Invalid days are rejected.
- Replaced incorrect validation tests with independent 12-month regressions.
- **ISS-006:** `formatBS` uses longest-first single-pass tokenization so month/weekday names are not corrupted (Mangsir, Magh, Budhabar, etc.).
- **ISS-019:** `daysBetweenBS` rewritten as absolute day-index difference from `REF_BS` (fixes same-month over-count and month-12→1 extra-Baisakh). BS→AD goldens + exhaustive 36525/36525 round-trips pass. Formatter weekday fixtures updated off the old May-15 encoding.
- **ISS-002 / Step 5:** Date-only conversion (`convertAdToBs` / `convertBsToAd`, `REF_AD_YMD`, pure Gregorian day numbers); formatter weekday via day index; `validateAdDate` without `Date`. Legacy `Date` APIs keep local-field semantics. TZ matrix green under UTC / Asia/Kathmandu / America/Los_Angeles.

### Added

- Format literal escape syntax: `[text]` emits literal characters that would otherwise be tokens.
- Conversion correctness baseline tests: dataset integrity + SHA-256 pin, sourced golden fixtures, exhaustive round-trips.
- Issue **ISS-019** documenting `daysBetweenBS` BS→AD over-count (discovered Step 4; fixed after authorization).
- Independent `days-between-bs` arithmetic regressions (same-month, month/year rollover, multi-year spans).
- `CalendarDate` / `AdDate` / `BsDate` types; `REF_AD_YMD`; `src/utils/gregorian.ts`; timezone + legacy Date semantics tests.
- Step 6 assessment: `scripts/bench-conversion.mjs` + `docs/progress/algorithm-assessment-step6.md` (ISS-003 measured; no production algorithm change).

### Fixed

- **ISS-003:** `convertAdToBs` uses internal year/month prefix tables (`bs-prefix.ts`) instead of day-by-day walk. BS→AD unchanged. Bulk 36,525 Ad→Bs ~9 ms (was ~23 s). Sub-µs single-call figures are timer-resolution limited; prefer bulk comparisons.

### Changed (process)

- Phase 1 CLOSED after Step 7 approval.
- Phase 2 architecture assessment published (`docs/architecture/phase2-assessment.md`); no production refactor yet.
- Stage 2.0 public API inventory frozen (`docs/api/public-api-inventory.md`).
- **ISS-020 / Stage 2.1:** `NepaliDatePicker` no longer imports the public barrel; cycle removed without API changes.
- **ISS-021 / Stage 2.2:** Datepicker uses `getDaysInMonth` instead of raw `BS_CALENDAR_DATA`.
- **Stage 2.3:** Split helpers into `utils/calendar.ts` (core) and `utils/localization.ts` (i18n); `helpers.ts` kept as re-export shim. No public API change.
- **Stage 2.4:** Physical `src/core/` + `src/i18n/` layout; `helpers.ts` removed; `ui/` retained. No public API / algorithm / dataset change.
- **Stage 2.5 / ISS-018:** Automated architecture boundary enforcement (Jest; negative fixtures). Ownership exceptions documented, not moved.
- **Stage 2.6:** Ownership cleanup — digits/names/i18n+ui types moved; public re-exports unchanged; ownership rules enforced.
- **Phase 3 Step 3.0:** Datepicker behavior assessment & redesign specification published (`docs/architecture/phase3-datepicker-assessment.md`). No production UI changes.
- **Phase 3 Stage 3.1 / ISS-022:** Pure `ui/state` + `ui/grid`; datepicker wired to them; destroy removes all listeners; weekday via date-only core API. No visual redesign; `innerHTML` retained until 3.2.
- **Phase 3 Stage 3.2 / ISS-014:** Safe DOM render (`ui/render.ts`); no `innerHTML` in datepicker; security regressions for HTML-looking labels.
- **Phase 3 Stage 3.3:** Keyboard nav (Esc/arrows/Home/End/Page/Enter/Space), roving tabindex, dialog/grid ARIA, live month region, focus restore; `ui/keyboard.ts`.
- **Phase 3 Stage 3.4 / ISS-012:** Deterministic popup positioning (`ui/position.ts`); no full-DOM z-index scan; sticky `zIndex` / `setZIndex` precedence; scroll/resize reposition.
- **Phase 3 Stage 3.5:** `minDate` / `maxDate` / `disabledDates` / `isDateDisabled`; Today + Clear; keyboard skips unavailable dates (`ui/constraints.ts`).
- **Phase 3 Stage 3.6:** Dual AD equivalent display (`ui/ad-display.ts`) — per-cell AD day + focused AD footer; BS remains authoritative for selection.
- **Phase 3 Stage 3.7:** Datepicker CSS theme tokens (`--np-*`); light/dark via existing `theme` option; no new runtime theme API.
- **Phase 3 CLOSED (2026-11-22):** Maintainer approved stages 3.1–3.7. Next recommended work is a Phase 4 quality-hardening **assessment** (not yet authorized); React and packaging remain deferred.
- **Phase 4 assessment (2026-11-22):** Integration & quality hardening assessment published (`docs/architecture/phase4-hardening-assessment.md`). No production code. Recommends docs sync → browser smoke → AT → optional mobile CSS → Phase 5 packaging.
- **Phase 4.1 (2026-11-22):** README / QUICK_START / API docs synchronized with Phase 3 datepicker + date-only APIs; ISS-016 provenance honesty; ISS-005 documented (`np` vs `ne`). No production code.
- **Phase 4.2 (2026-11-22):** Real-browser smoke B1–B8; measured mobile day **38×38** and popup **292px**; ISS-025 nested scroll. No production fixes.
- **Phase 4.3 (2026-11-22):** Manual accessibility — keyboard/ARIA-DOM PASS; NVDA/VO/Orca speech NOT TESTED; ISS-026/027 contrast filed; ISS-013 remains open. No production fixes.
- **Phase 4.4 (2026-11-22):** Mobile day **44px**, popup **344px**, weekday **12px**, AD **11px**; ISS-026/027 contrast tokens; desktop **42px** preserved. CSS-only.
- **ISS-025 (2026-11-22):** Datepicker repositions when scrollable ancestors scroll; listeners cleaned on close/destroy. No public API change. **Resolved** (maintainer close).
- **Phase 5 assessment (2026-11-22):** Packaging/CI report published; ISS-028 filed (empty CJS require). No package/CI code changes.
- **Phase 5.1 (2026-11-22):** CI honesty — removed `continue-on-error` from build/test (ISS-010). No packaging/export changes.
- **Phase 5.2–5.6 (2026-11-22):** Packaging release prep for **2.0.0** — CJS `.cjs` entry (ISS-028); `./styles` aliases `./css` (ISS-009); bundled `index.d.ts` (ISS-008); `pack:smoke` + CI/publish gates; migration guide. **npm publish not run.**

### Changed (process)

- Phase 0 formally CLOSED; Phase 1 AUTHORIZED and started
- Baseline recorded: Jest 53/53 green; ISS-001/006 still reproducible outside suite
- After ISS-001: Jest 63/63; ISS-006 still open

### Breaking Changes

- (none yet — policy documented for future 2.0)
