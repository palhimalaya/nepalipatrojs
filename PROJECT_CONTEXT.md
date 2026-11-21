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

- **BS years:** 2000–2099 (100 contiguous years in `src/constants/calendar-data.ts`)
- **Reference epoch:** `2000-01-01 BS` ≡ `1943-04-14 AD` (`REF_BS` / `REF_AD`)
- Dataset shape: `Record<year, [daysPerMonth[12], totalDays]>`
- Year totals in the dataset match `sum(daysPerMonth)` for sampled years (including leap-like 366-day BS years)

Do **not** replace calendar data or the reference epoch without proving accuracy.

## Current architecture (v1, high level)

```
src/
  index.ts                 # NepaliPatro facade + re-exports + window global
  constants/calendar-data  # BS month lengths + refs + digits
  converters/              # AD↔BS
  formatters/              # formatBS, toNepaliDigits
  utils/                   # helpers, validations
  types/                   # NepaliDate, enums, options
  ui/NepaliDatePicker.ts   # monolithic ~645-line datepicker
  ui/styles.css
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

**Phase 0 — COMPLETED** (audit, docs bootstrap, all five ADRs **Accepted** with amendments).

**Phase 1 — NOT STARTED.** Awaiting explicit authorization to implement (baseline → ISS-001 → ISS-006 → goldens/TZ → refactor).

## Known limitations (v1)

- No timezone-safe date-only API
- Broken/fragile BS day validation (wrong calendar-data indexing)
- Formatter token replacement corrupts some month/weekday names
- No generated `.d.ts` in `dist/` despite `package.json` `types` field
- CSS export path `./styles` → missing `only-styles.css`
- CI can “pass” with failed build/test (`continue-on-error: true`)
- Datepicker: no min/max, weak a11y, scans entire DOM for z-index
- BS range ends at 2099

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
