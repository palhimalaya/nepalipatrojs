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

- (none — no production code changes in Phase 0)

### Breaking Changes

- (none yet — policy documented for future 2.0)
