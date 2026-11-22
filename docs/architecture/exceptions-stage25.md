# Stage 2.5 — architectural exception evaluation

**Authorization:** Review only — **no moves** without separate approval.  
**Date:** 2026-11-22

## 1. `NEPALI_DIGITS` in `core/calendar-data.ts`

| Question | Answer |
|----------|--------|
| Why it exists | Historically co-located with `BS_CALENDAR_DATA` in the single constants file. |
| Violates intended architecture? | **Ownership yes** — digit glyphs are localization data, not calendar arithmetic. |
| Actual dependency coupling? | **Low.** Core never *uses* the digits; only `i18n/` imports them. Does not force `core → i18n`. |
| Smallest safe correction | Move `NEPALI_DIGITS` to `i18n/digits.ts` (or `i18n/localization.ts`). Update `i18n/format.ts` / `localization.ts` imports. Keep public `toNepaliDigits` / facade exports unchanged. Optional temporary re-export from `calendar-data` only if an undocumented deep import existed (none in-repo). |

**Proposal status:** Awaiting approval — not applied in Stage 2.5.

## 2. Locale enums in `core/types.ts`

(`NepaliMonth`, `NepaliMonthNepali`, `NepaliWeekDay`, `NepaliWeekDayNepali`)

| Question | Answer |
|----------|--------|
| Why it exists | v1 public types barrel; month/weekday *names* lived next to `NepaliDate`. |
| Violates intended architecture? | **Ownership yes** — display names are i18n. Month *numbers* 1–12 remain domain. |
| Actual dependency coupling? | **Low.** Core converters import only `CalendarDate` / `NepaliDate` / `AdDate` / `BsDate`. Enums are consumed by `i18n/` and public re-exports. |
| Smallest safe correction | Move name enums to `i18n/names.ts` (or similar). Re-export from `src/index.ts` for public API compatibility. Leave numeric date interfaces in `core/types.ts`. |

**Proposal status:** Awaiting approval — not applied in Stage 2.5.

## 3. Options / pattern types in `core/types.ts`

| Symbol | Intended owner | Notes |
|--------|----------------|-------|
| `NepaliPatroOptions` | i18n / public API | `language` / `format` are presentation |
| `DateFormatPattern` | i18n | Used by parse patterns |
| `NepaliDatePickerOptions` | ui | theme, zIndex — UI-specific |

| Question | Answer |
|----------|--------|
| Why it exists | Single `types` module for the public surface. |
| Violates intended architecture? | **Ownership yes** for picker options; soft for format options. |
| Actual dependency coupling? | **None in core logic** — core files do not import these interfaces. UI and i18n do. |
| Smallest safe correction | Move `NepaliDatePickerOptions` → `ui/types.ts` (or keep exported only via facade). Move `NepaliPatroOptions` + `DateFormatPattern` → `i18n/types.ts`. Re-export unchanged names from `index.ts`. |

**Proposal status:** Awaiting approval — not applied in Stage 2.5.

## 4. Other localization / UI concepts in core?

Scanned `src/core/**`: no other locale strings, DOM types, or picker logic. `REF_*` and range constants correctly belong in core.

## Enforcement note

Stage 2.5 rules catch **import/DOM/cycle/export** violations. They do **not** yet fail the build solely because digits/enums are co-located in core files. That ownership cleanup is a follow-up once approved.
