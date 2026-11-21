# ADR-001: Core architecture and package shape

- **Date:** 2026-11-21
- **Status:** Accepted
- **Phase:** 0
- **Accepted:** 2026-11-21 (maintainer review; safeguards added)

## Context

v1 is a flat `src/` tree with a circular dependency between `index` and `NepaliDatePicker`, duplicated calendar lookups, and UI mixed with conversion. The modernization brief suggested a multi-package monorepo (`core`, `i18n`, `datepicker`, `react`).

## Decision history

1. **Proposed (2026-11-21):** Single npm package with internal modules; core without DOM/React; defer multi-package publish.
2. **Accepted (2026-11-21):** Same direction, with explicit export boundaries and automated boundary enforcement.

## Decision (accepted)

1. Ship **one npm package** `nepalipatrojs` for v2.
2. Organize **internal modules** (`core`, `i18n`, `datepicker`, optional `react`) with hard boundaries.
3. **`core` has zero DOM and React dependencies** (no `window`/`document`, no React imports).
4. **React is an optional integration** in the same package (e.g. export path). Vanilla/CDN consumers must **not** need React installed as a runtime dependency.
5. Define **explicit package export boundaries** in `package.json` `exports` (public entry points only).
6. **Enforce module dependency boundaries** through lint rules and/or architecture tests where practical (e.g. core must not import datepicker/react).
7. Defer splitting into multiple published packages until there is a clear independent versioning need.

## Alternatives considered

| Alternative | Why not (for now) |
|-------------|-------------------|
| Multi-package monorepo immediately | Tooling cost, versioning complexity, little consumer benefit |
| React-only datepicker | Excludes CDN/vanilla and non-React hosts |
| Keep monolithic class + light cleanup | Does not meet maintainability / a11y / dual-calendar goals |

## Consequences

- Simpler publish and docs story.
- Export map can expose `nepalipatrojs/react` without making React a dependency of the main entry.
- Boundary lint/tests are part of Definition of Done for Phase 2+.
- The datepicker consumes the same core APIs as Node and React — UI does not own calendar logic.
