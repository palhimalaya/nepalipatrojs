# Testing strategy

## Layers

1. **Conversion goldens** — fixed AD↔BS pairs; round-trips; range edges  
2. **Validation** — invalid Y/M/D; correct month lengths from dataset  
3. **Timezone** — run date-only suites under multiple `TZ`  
4. **Formatting / i18n** — tokens, digits, locales; Mangsir/Budhabar regressions  
5. **Datepicker** — jsdom: open/select/close/destroy/constraints/keyboard  
6. **Packaging smoke** — `npm pack` + install + resolve exports/types  

## Rules

- Do not delete failing tests to “go green”; fix code or fix incorrect tests with explanation.
- Record real results in `docs/progress/TEST-RESULTS.md`.
- Coverage thresholds: set after baseline capture (Phase 1), not before.

## Current suite (v1 locations)

- `src/__tests__/index.test.ts`
- `src/__tests__/formatters/date-formatter.test.ts`
- `src/__tests__/utils/helpers.test.ts`
- `src/__tests__/utils/validations.test.ts` — **encodes ISS-001 indexing bug**
- `src/__tests__/ui/NepaliDatePicker.test.ts`
