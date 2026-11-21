# API — Formatting (draft)

## v1

```ts
NepaliPatro.formatBS(date, format = 'YYYY-MM-DD', options?: { language?: 'en' | 'np' })
NepaliPatro.toNepaliDigits(num)
NepaliPatro.nepaliDigitsToEnglish(text)
```

**Known issues:** docs show `language: 'ne'`; runtime uses `'np'`. Token replace bug ISS-006.

## Planned v2

Canonical `language: 'en' | 'ne'` with `np` alias; safe token formatter.
