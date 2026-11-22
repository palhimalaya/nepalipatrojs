# Stage 2.5 exceptions → Stage 2.6 resolution

**Stage 2.5:** Evaluation only.  
**Stage 2.6:** Ownership moves applied (2026-11-22). Public export names unchanged via `src/index.ts`.

| Symbol | Decision | Destination |
|--------|----------|-------------|
| `NEPALI_DIGITS` | Moved | `i18n/digits.ts` |
| Locale name enums | Moved | `i18n/names.ts` |
| `DateFormatPattern` | Moved | `i18n/types.ts` |
| `NepaliPatroOptions` | Inspected → **i18n** (not facade-defined) | `i18n/types.ts` |
| `NepaliDatePickerOptions` | Moved | `ui/types.ts` |

### Why `NepaliPatroOptions` is in i18n (not defined on the facade)

It is formatting/presentation configuration consumed by `formatBS`. Defining it only in `index.ts` would force `i18n/format.ts` to import the public barrel (`i18n → facade`), which violates `no-barrel-import` and risks cycles. Ownership is therefore `i18n/types.ts`, with an identical public re-export from `index.ts`.

### Remaining exceptions

None for Stage 2.5 ownership items. Datepicker folder remains `ui/` until Phase 3.
