# API — Conversion (draft)

> Describes **current v1** behavior. v2 date-only APIs are planned (ADR-002); not implemented yet.

## v1

```ts
NepaliPatro.convertADToBS(date: Date | number[]): NepaliDate
NepaliPatro.convertBSToAD(bsDate: NepaliDate | number[]): Date
NepaliPatro.getCurrentBSDate(): NepaliDate
NepaliPatro.now(): NepaliDate
```

Array form is `[year, month, day]` with **1-based months**.

## Planned v2

```ts
convertAdToBs(ad: { year: number; month: number; day: number }): BsDate
convertBsToAd(bs: BsDate): AdDate
// Date wrappers retained for compatibility
```

See migration guide when implemented.
