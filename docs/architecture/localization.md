# Localization and formatting

## Current state

| Concern | Implementation |
|---------|----------------|
| Locale option type | `'en' \| 'np'` in `NepaliPatroOptions` / picker options |
| README / Quick Start | Often show `'ne'` for `formatBS` |
| Digits → Nepali | `toNepaliDigits` in formatter; `localizeDigits` in `utils/localization.ts` |
| Digits → English | `nepaliDigitsToEnglish` in `utils/localization.ts` |
| Month names (picker) | `localizeMonth` in `utils/localization.ts` |
| Month / weekday enums | TypeScript enums (`NepaliMonth`, `NepaliMonthNepali`, …) |
| Parse patterns | `getDateFormatPatterns` in `utils/localization.ts` |
| Format tokens | `YYYY YY MMMM MMM MM M DD D dddd ddd d` via sequential `String.replace` |

**Stage 2.3:** localization helpers live in `src/utils/localization.ts` (no DOM; no import of `calendar.ts`). Physical `src/i18n/` folder is Stage 2.4.

## Verified bugs

| ID | Issue |
|----|-------|
| ISS-005 | Docs use `'ne'`; runtime checks `'np'`. Passing `'ne'` does **not** enable Nepali digits/names. |
| ISS-006 | **Resolved (2026-11-21):** sequential `/M/g` `/d/g` corruption. Fixed via longest-first tokenization + `[literal]` escapes. |
| ISS-007 | Ambiguous parse patterns: DD-MM-YYYY and MM-DD-YYYY share the same regex; first match wins. |

## Accepted v2 (ADR-005)

1. Canonical locale ids: **`en`** and **`ne`** (BCP 47).
2. Compatibility alias: **`np` → `ne`** (deprecate; document).
3. Dedicated `i18n` module: locale tables, digit maps, safe token formatter.
4. Tokenization-based formatter — never regex-replace single-letter tokens over already-expanded names (fixes ISS-006).
5. Optional later: `digits: 'latn' | 'deva'` independent of language for month names.
