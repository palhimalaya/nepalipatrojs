# API — Formatting

## Public surface

```ts
NepaliPatro.formatBS(date, format = 'YYYY-MM-DD', options?: NepaliPatroOptions): string
formatBSDate(date, format?, options?)  // named export — same implementation
NepaliPatro.toNepaliDigits(num)
NepaliPatro.nepaliDigitsToEnglish(text)
```

`NepaliPatroOptions`:

```ts
{ language?: 'en' | 'np' }
```

## Locale (ISS-005)

| Code | Supported? | Behavior |
|------|------------|----------|
| `en` | Yes (default) | English month/weekday names; Western digits |
| `np` | Yes | Nepali (Devanagari) names + Nepali digits |
| `ne` | **No** (do not use) | Not a documented synonym; may partially change names without Nepali digits |

Future work may canonicalize BCP-47 `ne` with `np` as alias — **not implemented**.

## Tokens

`YYYY` `YY` `MMMM` `MMM` `MM` `M` `dddd` `ddd` `DD` `D` `d`, plus `[literal]` escapes.

Weekday tokens use date-only `getBsWeekdayIndex` (not `Date.getDay()`).

ISS-006 (token corruption of month/weekday names) is **resolved**.
