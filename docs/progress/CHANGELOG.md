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

### Changed (process)

- Phase 0 formally CLOSED; Phase 1 AUTHORIZED and started
- Baseline recorded: Jest 53/53 green; ISS-001/006 still reproducible outside suite
- After ISS-001: Jest 63/63; ISS-006 still open

### Breaking Changes

- (none yet — policy documented for future 2.0)
