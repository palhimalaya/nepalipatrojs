# NepaliPatroJS — Project Context

> Read this first in any new AI or human coding session, then follow the links.

## What it is

**NepaliPatroJS** is a TypeScript/JavaScript library for the **Bikram Sambat (BS)** Nepali civil calendar: conversion to/from Gregorian (**AD**), formatting/localization, and a browser datepicker.

- npm: `nepalipatrojs` (current published: **1.0.5**)
- Repo: https://github.com/palhimalaya/nepalipatrojs
- License: MIT (Copyright 2025 Himalaya Pal)
- Target major version in progress: **2.0**

Intended consumers: Nepali web apps, business platforms, forms needing BS dates, CDN/browser scripts, and (planned) React apps. The **core conversion engine must stay UI- and framework-independent**.

## Current stack (v1)

| Area | Choice |
|------|--------|
| Language | TypeScript (strict) |
| Bundle | Rollup → UMD + ESM + CSS |
| Tests | Jest + ts-jest + jsdom |
| Runtime deps | `tslib` only |
| UI | Vanilla DOM datepicker + CSS |
| CI | GitHub Actions (Node 18/20) |

## Supported calendar range (verified)

- **BS years:** 2000–2099 (100 contiguous years in `src/core/calendar-data.ts`)
- **Reference epoch:** `2000-01-01 BS` ≡ `1943-04-14 AD` (`REF_BS` / `REF_AD`)
- Dataset shape: `Record<year, [daysPerMonth[12], totalDays]>`
- Year totals in the dataset match `sum(daysPerMonth)` for sampled years (including leap-like 366-day BS years)

Do **not** replace calendar data or the reference epoch without proving accuracy.

## Current architecture (after Stage 2.4)

```
src/
  index.ts                 # public compatibility facade + window global
  core/                    # no i18n, no DOM; date domain only
    calendar-data.ts       # BS month lengths + refs (no digit glyphs)
    types.ts               # CalendarDate / NepaliDate / AdDate / BsDate
    calendar.ts, gregorian.ts, validations.ts
    converters/
  i18n/                    # no DOM
    digits.ts, names.ts, types.ts
    localization.ts, format.ts
  ui/
    types.ts               # NepaliDatePickerOptions
    NepaliDatePicker.ts, styles.css
```

## Design principles for v2 (Accepted ADRs)

1. **Single package**, internal modules; enforce boundaries (ADR-001).
2. **Core** has zero DOM/React deps; React is optional; datepicker does not own calendar logic.
3. **Date-only** `{ year, month, day }` is the foundation of new conversion APIs (ADR-002).
4. Legacy **`Date` APIs keep v1 local-calendar-field semantics**; UTC only via an explicit API — never a silent switch.
5. **Preserve** `BS_CALENDAR_DATA` and `2000-01-01 BS = 1943-04-14 AD`; do not replace/extend without approval (ADR-003). Round-trips ≠ historical proof. Provenance currently **unknown** (ISS-016).
6. Vanilla datepicker first-class; a11y/keyboard/lifecycle/safe DOM required (ADR-004).
7. Locales: canonical **`en` | `ne`**, alias **`np` → `ne`**; freeze v1 API docs before removals (ADR-005).
8. Never mark work complete without verified build/tests/docs updates.

## Localization convention (Accepted)

- Canonical: `'en' | 'ne'`
- Compatibility alias: `'np'` → `'ne'`
- v1 code still uses `'np'` until Phase 1 implements the alias mapping

## Commands

```bash
npm ci
npm test
npm run build
# Planned: npm run typecheck, lint, pack:smoke
```

## Development status

**Phase 0 — CLOSED** (ADRs Accepted).

**Phase 1 — CLOSED.** Correctness, timezone, ISS-003 prefix AD→BS approved.

**Phase 2 — COMPLETED** (architecture + ownership).

**Phase 3 — Datepicker redesign CLOSED** (maintainer approved 2026-11-22).

- Modular datepicker: state/grid, safe DOM, keyboard/ARIA, positioning, constraints, AD equivalents, `--np-*` theme tokens
- Deferred: full AD grid / mode switch; `ui/` rename; real-browser / AT certification
- Carry-forward: ISS-013 (AT), ISS-016 (provenance), ISS-024 (footer = focus)
- Locks: barrel-only entry; no packaging/React without auth
- Sizing decision (2026-11-22): no CSS follow-up; mobile hit-target / Nepali density checks → Phase 4 assessment
- **Next:** Await Phase 4 assessment prompt (assessment only; no CSS/packaging/React).

## Known limitations (v1)

- Legacy `Date` APIs remain timezone-sensitive by design (prefer date-only APIs)
- Dataset provenance unknown (ISS-016)
- No generated `.d.ts` in `dist/` despite `package.json` `types` field
- CSS export path `./styles` → missing `only-styles.css`
- CI can “pass” with failed build/test (`continue-on-error: true`)
- Datepicker: Jest-covered a11y/keyboard only — not AT-certified (ISS-013); no real-browser smoke yet
- AD footer tracks focus, not hover (ISS-024 accepted)
- BS range ends at 2099
- (ISS-003 resolved — AD→BS uses prefix tables)

## Where to go next

| Need | Document |
|------|----------|
| Current status | [docs/progress/STATUS.md](docs/progress/STATUS.md) |
| Roadmap | [docs/progress/MASTER-PLAN.md](docs/progress/MASTER-PLAN.md) |
| Bugs / debt | [docs/progress/ISSUES.md](docs/progress/ISSUES.md) |
| Decisions | [docs/progress/DECISIONS.md](docs/progress/DECISIONS.md) |
| Architecture | [docs/architecture/README.md](docs/architecture/README.md) |
| Latest session | [docs/progress/logs/](docs/progress/logs/) |
| Docs index | [docs/README.md](docs/README.md) |
