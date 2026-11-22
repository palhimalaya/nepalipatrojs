# Datepicker architecture

## Current (v1)

Single class: `src/ui/NepaliDatePicker.ts` (~645 lines).

| Concern | How it is handled today |
|---------|-------------------------|
| State | Instance fields (`currentBSYear/Month/Day`, visibility) |
| Parsing | Inline regex + month-name parsers |
| Rendering | HTML strings via `innerHTML` |
| Navigation | Prev/next + `<select>` handlers |
| Positioning | Absolute under input; flip if near edges |
| Z-index | Walk ancestors + modal selectors + **`querySelectorAll('*')`** |
| Theme | CSS class `nepali-datepicker-light/dark` |
| Locale | `en` / `np` digit and month localization |
| Events | Sets `input.value`, dispatches `change` |
| Cleanup | `destroy()` removes listener + instance from static `Set` |
| Import | converters/formatters/types/helpers + year range (Stages 2.1–2.2); **no barrel**; **no `BS_CALENDAR_DATA`** |

### Missing product features

- Dual AD/BS calendar modes
- Today / Clear
- minDate / maxDate / disabledDates / `isDateDisabled`
- Keyboard navigation, focus trap, ARIA
- Escape to close (outside click exists)
- Safe HTML escaping for dynamic content
- Predictable z-index without full-DOM scan

### Visual (v1)

Functional but generic system-font UI; heavy shadow; not dual-calendar; not mobile-sheet oriented. Redesign is Phase 3.

## Proposed v2 modules (vanilla)

```
datepicker/
  NepaliDatePicker.ts      # public class; wires modules
  state/store.ts           # selected, view month/year, open, calendarSystem
  parse/input-parser.ts    # format-aware parsing
  calendar-view/grid.ts    # pure: build month cells (no DOM)
  calendar-view/render.ts  # DOM createElement (prefer over innerHTML)
  navigation/controllers.ts
  positioning/placement.ts # configurable strategy; no full-DOM z-index scan
  a11y/keyboard.ts
  a11y/aria.ts
  theme/                   # light/dark tokens
  styles/
```

### Design direction (approved intent; details in ADR-004)

- Modern minimal light/dark themes
- Clear today vs selected states
- Optional AD equivalent when viewing BS (and vice versa)
- Responsive; restrained motion
- Accessible keyboard + screen reader labels
- Configurable `zIndex`; default high constant or stacking-context aware **without** scanning every node

### React

- Separate module/export: controlled + uncontrolled wrappers around the same core date model
- Core must not import React

### Strategy recommendation

**Keep vanilla DOM datepicker as the primary browser component**; add React as an integration layer. Do not rewrite the picker in React-only form — backend and non-React apps need the same engine and a usable vanilla UI.
