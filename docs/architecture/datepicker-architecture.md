# Datepicker architecture

## Current (v1 → Stage 3.3)

Orchestrator: `src/ui/NepaliDatePicker.ts`  
Pure modules: `src/ui/state.ts`, `src/ui/grid.ts`, `src/ui/keyboard.ts`  
Safe DOM: `src/ui/render.ts`

**Full Phase 3.0 assessment:** [phase3-datepicker-assessment.md](phase3-datepicker-assessment.md).

| Concern | How it is handled today |
|---------|-------------------------|
| State | Pure `state.ts` (`view`, `selected`, `focused`, `open`, `destroyed`, `today`) |
| Grid model | Pure `grid.ts` → 42 `CalendarCell`s; `getDaysInMonth` + `getBsWeekdayIndex` |
| Keyboard math | Pure `keyboard.ts` — day/week/month moves; **week starts Sunday** |
| Parsing | Still inline in orchestrator (regex + month-name parsers) |
| Rendering | Safe DOM via `render.ts` (`createElement` / text nodes) — **no `innerHTML`** |
| Navigation | Prev/next + `<select>` + PageUp/PageDown / arrows |
| Positioning | Absolute under input; flip if near edges (**Stage 3.4**) |
| Z-index | Walk ancestors + modal selectors + **`querySelectorAll('*')`** (**Stage 3.4**) |
| Theme | CSS class `nepali-datepicker-light/dark` |
| Locale | `en` / `np` digit and month localization |
| Events | Sets `input.value`, dispatches `change` |
| Cleanup | See listener inventory below |
| Import | `core/` + `i18n/`; **no barrel**; **no `BS_CALENDAR_DATA`** |

### Week-start convention

Grid columns and keyboard Home/End use **Sunday → Saturday** (weekday index 0 = Sunday), matching historical UI labels (`S M T W T F S` / Nepali equivalents).

### Keyboard map

| Key | Behavior |
|-----|----------|
| Escape | Close popup; restore focus to input |
| ArrowLeft / ArrowRight | ±1 day (crosses month/year) |
| ArrowUp / ArrowDown | ±7 days |
| Home / End | First / last day of current week (Sun–Sat) |
| PageUp / PageDown | Previous / next BS month (day clamped) |
| Enter | Select focused day (native button activation) |
| Space | Select focused day (explicit; prevents scroll) |
| Tab / Shift+Tab | Not trapped — natural tab order through header controls + one roving day cell |

Navigation keys apply only when a `.nepali-day` has focus (input editing preserved while open). Keys are ignored when closed.

### Focus policy

- On open: focus selected (if in view), else today (if in view), else day 1.
- Roving `tabindex`: one day `0`, others `-1`.
- Focused date ≠ selected date (distinct state).
- Escape / selection → focus returns to input.
- Outside click closes without forcing input focus.
- Teardown blurs focused day before DOM removal (no detached activeElement).
- Opening one instance closes others; does not steal focus across destroyed trees.

### ARIA semantics

| Element | Semantics |
|---------|-----------|
| Input | `aria-haspopup="dialog"`, `aria-expanded`, `aria-controls` (restored on destroy) |
| Popup root | `role="dialog"`, `aria-modal="false"` (no focus trap), accessible name |
| Live region | Visually hidden `aria-live="polite"` announces month/year |
| Calendar | `role="grid"` + six `role="row"` weeks |
| Cells | `role="gridcell"` wrapping `button.nepali-day`; `aria-selected`; `aria-current="date"` for today |
| Day button | `aria-label` with full localized date |
| Nav / selects | Accessible names (Previous/Next month, Month, Year) |

### Listener inventory (lifecycle)

| Listener | Target | Registration | Removed |
|----------|--------|--------------|---------|
| `onInputClick` | input | `init()` | `destroy()` |
| `onDocumentClick` | `document` | `init()` | `destroy()` |
| `onDocumentKeydown` | `document` | `init()` | `destroy()` |
| prev/next/month/year/calendar click | popup DOM | `setupCalendarEvents` | `teardownCalendarDom()` on close/re-render/destroy |

No duplicate popup listeners across re-renders: teardown runs before each rebuild.

### Remaining accessibility limitations

- Not a full screen-reader certification — tests assert roles/names/DOM behavior only.
- `aria-modal="false"` by design (non-trapping); differs from assessment draft `true`.
- No disabled-date announcements yet (Stage 3.5).
- No Today/Clear controls (Stage 3.5).
- Visual redesign / stronger contrast tokens deferred to Stage 3.7.
- Input accessible **name** still depends on host page (`<label>` / `aria-label`); picker does not invent one.

### Missing product features

- Dual AD/BS calendar modes
- Today / Clear
- minDate / maxDate / disabledDates / `isDateDisabled`
- Predictable z-index without full-DOM scan

### Visual (v1)

Functional but generic system-font UI; heavy shadow; not dual-calendar; not mobile-sheet oriented. Redesign is Phase 3 Stage 3.7. Stage 3.3 added only `:focus-visible` rings and week-row structure (layout parity).

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
