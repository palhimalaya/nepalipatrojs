# Decisions index

| ADR | Title | Status |
|-----|-------|--------|
| [ADR-001](../decisions/ADR-001-core-architecture.md) | Core architecture and package shape | **Accepted** |
| [ADR-002](../decisions/ADR-002-date-only-and-timezone.md) | Date-only model and timezone safety | **Accepted** (amended) |
| [ADR-003](../decisions/ADR-003-calendar-data.md) | Calendar dataset and reference epoch | **Accepted** (amended) |
| [ADR-004](../decisions/ADR-004-datepicker-design.md) | Datepicker stack and UI direction | **Accepted** |
| [ADR-005](../decisions/ADR-005-public-api-and-compatibility.md) | Public API and compatibility | **Accepted** (amended) |

## Acceptance summary (2026-11-21)

- All five ADRs are **Accepted**.
- Amendments applied to ADR-002, ADR-003, and ADR-005 before acceptance.
- ADR-001 and ADR-004 accepted with additional safeguards recorded in the ADR bodies.

## Protected principles

1. Date-only `CalendarDate` is the foundation of new core APIs.
2. Preserve `BS_CALENDAR_DATA` and reference epoch; do not optimize before goldens.
3. Datepicker consumes core; it does not own calendar logic.
4. Legacy `Date` APIs keep v1 **local** calendar-field semantics; UTC only via explicit API.
