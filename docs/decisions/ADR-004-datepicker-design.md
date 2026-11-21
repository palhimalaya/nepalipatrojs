# ADR-004: Datepicker stack and UI direction

- **Date:** 2026-11-21
- **Status:** Accepted
- **Phase:** 0
- **Accepted:** 2026-11-21 (maintainer review; a11y/lifecycle/styling safeguards added)

## Context

The v1 datepicker is a monolithic vanilla class with limited features and outdated UX. Product goals include dual AD/BS calendars, modern light/dark UI, a11y, and React integration for a business platform — without coupling core conversion to React.

## Decision history

1. **Proposed (2026-11-21):** Vanilla first-class; modular decomposition; React later; modern minimal UI; no full-DOM z-index scan.
2. **Accepted (2026-11-21):** Same, with accessibility, keyboard, safe DOM, lifecycle, and theming as **architectural requirements**.

## Decision (accepted)

1. **Vanilla DOM datepicker remains first-class** (CDN/UMD + ESM).
2. **React is a separate optional integration** in the same npm package after core + vanilla APIs stabilize. Vue deferred until React + core are stable.
3. Decompose into modules (state, parse, grid, render, position, a11y, theme).
4. **Separation:** Datepicker **consumes** core calendar APIs; it must **not** own or reimplement conversion/month-length logic.
5. **Safe dynamic DOM rendering:** no unsafe insertion of untrusted/dynamic HTML; prefer `createElement` / text nodes; escape if strings are unavoidable.
6. **Accessibility and keyboard navigation** are architectural requirements (not optional polish): focus management, ARIA labels/roles, Escape to close, arrow-key day movement (details in Phase 3 spec).
7. Define **component lifecycle and cleanup contracts** (`destroy` / unmount removes listeners, DOM nodes, instance registry entries; no leaks).
8. **No full-document z-index scanning**; configurable `zIndex` and predictable positioning.
9. **Styling customizable** without forcing the default theme (CSS variables / theme classes / documented override points; consumers may omit or replace default CSS).
10. Visual direction: modern minimal light/dark; clear today vs selected; optional dual-date display; restrained motion.

## Alternatives considered

| Alternative | Why not |
|-------------|---------|
| React-only component library | Breaks CDN/vanilla story |
| Wrap an existing generic datepicker | Poor BS month-length / dual calendar fit |
| Keep one 645-line class | Blocks testing and a11y work |

## Consequences

- More files, clearer tests; Phase 3 is a redesign, not a skin tweak.
- CSS/visual changes are breaking for v1 skin consumers — migration guide required.
- React optional peer dependency pattern for the React export path.
