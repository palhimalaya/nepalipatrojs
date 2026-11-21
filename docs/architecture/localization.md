# Localization and formatting

## Current state

| Concern | Implementation |
|---------|----------------|
| Locale option type | `'en' \| 'np'` in `NepaliPatroOptions` / picker options |
| README / Quick Start | Often show `'ne'` for `formatBS` |
| Digits → Nepali | `toNepaliDigits` in formatter; `localizeDigits` in helpers |
| Digits → English | `nepaliDigitsToEnglish` in helpers |
| Month / weekday names | TypeScript enums (`NepaliMonth`, `NepaliMonthNepali`, …) |
| Format tokens | `YYYY YY MMMM MMM MM M DD D dddd ddd d` via sequential `String.replace` |

## Verified bugs

| ID | Issue |
|----|-------|
| ISS-005 | Docs use `'ne'`; runtime checks `'np'`. Passing `'ne'` does **not** enable Nepali digits/names. |
| ISS-006 | After substituting `MMMM`/`dddd`, later `/M/g` and `/d/g` replacements corrupt names containing those letters (e.g. **Mangsir** → `8angsir`, **Budhabar** → `Bu4habar`). Tests use **Baisakh**, which hides the bug. |
| ISS-007 | Ambiguous parse patterns: DD-MM-YYYY and MM-DD-YYYY share the same regex; first match wins. |

## Accepted v2 (ADR-005)

1. Canonical locale ids: **`en`** and **`ne`** (BCP 47).
2. Compatibility alias: **`np` → `ne`** (deprecate; document).
3. Dedicated `i18n` module: locale tables, digit maps, safe token formatter.
4. Tokenization-based formatter — never regex-replace single-letter tokens over already-expanded names (fixes ISS-006).
5. Optional later: `digits: 'latn' | 'deva'` independent of language for month names.
