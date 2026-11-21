# ADR-002: Date-only model and timezone safety

- **Date:** 2026-11-21
- **Status:** Accepted
- **Phase:** 0
- **Accepted:** 2026-11-21 (after amendment clarifying legacy `Date` semantics)

## Context

A JavaScript `Date` represents an **instant** (timestamp), not a civil calendar date. v1 conversion uses `new Date(y, m-1, d)`, local getters (`getFullYear` / `getMonth` / `getDate`), and `REF_AD = new Date(1943, 3, 14)`. Results can differ by host timezone. Business platforms need deterministic civil dates for the **new** API surface, without silently breaking existing `Date`-based callers.

## Decision history

1. **Proposed (2026-11-21):** Date-only core; `Date` wrappers; suggested UTC extraction for new paths (choice left open).
2. **Amended & accepted (2026-11-21):** Date-only is canonical for new APIs. **Legacy `Date` APIs keep v1 local-calendar-field semantics.** UTC conversion only via an **explicit** API. Do not silently switch local → UTC getters.

## Decision (accepted)

### Canonical type

```ts
interface CalendarDate {
  year: number;  // full year
  month: number; // 1–12
  day: number;   // 1–31 (calendar-dependent)
}
```

Use aliases such as `BsDate` / `AdDate` as needed; both are date-only.

### Rules

1. **New** conversion and arithmetic APIs accept/return `CalendarDate` (or equivalents) and **never** depend on host timezone.
2. All core conversion/arithmetic operates on date-only values and the BS dataset — **not** on `Date` instants.
3. Store reference dates as date-only objects, e.g. `REF_AD = { year: 1943, month: 4, day: 14 }` (not a `Date`).
4. **Existing `Date`-based public APIs** retain **v1 local-calendar-field behavior** for compatibility:
   - Input: extract calendar fields via **local** getters (`getFullYear`, `getMonth` + 1, `getDate`).
   - Output (where returning `Date`): continue the v1 construction/adjustment pattern based on local calendar fields, documented as legacy.
5. **Do not** silently change legacy `Date` inputs from local getters to UTC getters.
6. If UTC-based conversion of a `Date` is required, expose it as an **explicit** API (name TBD, e.g. `convertAdDateUtcToBs`), not as a quiet semantics change.
7. Document clearly: date-only values vs timestamps vs legacy `Date` wrappers.

### Testing

- Date-only conversion must return **identical** results under different `TZ` environments (at least `UTC`, `Asia/Kathmandu`, and one Americas zone).
- Legacy `Date` API tests document local-field behavior; timezone variance for legacy wrappers is expected and documented — not “fixed” by changing to UTC.

## Alternatives considered

| Alternative | Notes |
|-------------|-------|
| Silently switch legacy APIs to UTC getters | Rejected — can change BS results for existing consumers |
| Always use local timezone for new APIs | Rejected — breaks server/Node determinism |
| Temporal-only | Optional later; runtime support uneven |
| Luxon/dayjs | Avoid unless necessary; keep core dependency-free |

## Consequences

- New preferred path is timezone-safe.
- Legacy `Date` path remains timezone-sensitive by design (compatibility).
- Migration guide must explain both paths with examples.
- Original proposal’s lean toward UTC for wrappers is **superseded** by this amendment.
