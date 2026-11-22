# Localization and formatting

## Current state

| Concern | Implementation |
|---------|----------------|
| Locale option type | `'en' \| 'np'` in `NepaliPatroOptions` / picker options |
| README / Quick Start | Stage 4.1 documents `'np'`; warns against `'ne'` (ISS-005 still open for code alias) |
| Digits → Nepali | `NEPALI_DIGITS` in `i18n/digits.ts`; `toNepaliDigits` / `localizeDigits` |
| Digits → English | `nepaliDigitsToEnglish` in `i18n/localization.ts` |
| Month / weekday enums | `i18n/names.ts` |
| Options / patterns | `NepaliPatroOptions`, `DateFormatPattern` in `i18n/types.ts` |
| Format tokens | `formatBS` in `i18n/format.ts` (longest-first tokenization) |

**Stage 2.6:** i18n owns localization data/types; may import `core/` date types + weekday index; must not import `ui/`.

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
