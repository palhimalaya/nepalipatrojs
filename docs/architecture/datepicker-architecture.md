# Datepicker architecture

## Current (v1 → Stage 3.7)

Orchestrator: `src/ui/NepaliDatePicker.ts`  
Pure modules: `state`, `grid`, `keyboard`, `position`, `constraints`, `ad-display`  
Safe DOM: `src/ui/render.ts`  
Styles: `src/ui/styles.css` (`--np-*` tokens; light/dark)

**Full Phase 3.0 assessment:** [phase3-datepicker-assessment.md](phase3-datepicker-assessment.md).  
**Public options:** [datepicker.md](../api/datepicker.md).

| Concern | How it is handled today |
|---------|-------------------------|
| State | Pure `state.ts` (`view`, `selected \| null`, `focused`, `open`, `destroyed`, `today`) |
| Grid model | Pure `grid.ts` → 42 cells with `disabled` flag |
| Constraints | Pure `constraints.ts` — inclusive min/max + list + predicate |
| Keyboard math | Pure `keyboard.ts` — skips unavailable dates |
| Parsing | Inline; out-of-range parsed values are not applied |
| Rendering | Safe DOM; Today/Clear; disabled days; AD day subtitle + AD footer |
| Dual calendar | BS primary; AD via `convertBsToAd` (no AD grid / mode switch) |
| Navigation | Prev/next + `<select>` + PageUp/PageDown / arrows |
| Positioning | `position.ts` — body-attached `absolute` |
| Z-index | Sticky precedence (no DOM scan) |
| Theme | `theme` option → light/dark class; `--np-*` CSS variables (Stage 3.7) |
| Locale | `en` / `np` digit and month localization |
| Events | Select/Today/Clear → `change` (Clear keeps popup open) |
| Cleanup | See listener inventory below |
| Import | `core/` + `i18n/`; **no barrel**; **no `BS_CALENDAR_DATA`** |

### Constraints (Stage 3.5)

- **Inclusive** `minDate` / `maxDate` (BS `NepaliDate`) — **copied** at construction.
- `disabledDates: NepaliDate[]` — exact matches; **snapshotted** (new array + copied triples) at construction. Caller mutations afterward are ignored.
- `isDateDisabled?(date): boolean` — `true` means unavailable; function **reference retained** and evaluated **dynamically** on every check.
- Combined with OR (any rule disables).
- Comparisons use civil Y-M-D order only (timezone-independent).
- Malformed dates ignored (warn). `minDate > maxDate` → both bounds ignored (warn).
- Unavailable days: `disabled` + `aria-disabled`; not mouse/keyboard selectable.
- There is **no** runtime constraint-mutation API (`setMinDate`, etc.); use a dynamic predicate when availability must change after construct.

### Positioning strategy (Stage 3.4 / ISS-012)

- Popup is appended to **`document.body`** (document coordinates).
- Measure input + popup rects once, then write `top` / `left` / `z-index`.
- Prefer **below** the input (`POPUP_GAP_PX = 4`); flip **above** when space below is insufficient and space above is adequate.
- Prefer left-aligned to the input; if that overflows the viewport, align to the input’s right edge; clamp into the viewport with a small margin.
- While open: `window` `resize` + capturing `scroll` recalculate position (rAF-coalesced).
- Listeners removed on close / re-render teardown / destroy.

### Z-index precedence

| Priority | Source | Behavior |
|----------|--------|----------|
| 1 (highest) | `setZIndex(n)` | Sticky runtime override until destroy |
| 2 | Constructor `options.zIndex` | Sticky for the instance |
| 3 | `DEFAULT_POPUP_Z_INDEX` (`999999`) | Library default |

Opening the popup does **not** re-resolve or escalate z-index. No ancestor walk, modal selector scan, or `querySelectorAll('*')`.

### Week-start convention

Grid columns and keyboard Home/End use **Sunday → Saturday** (weekday index 0 = Sunday), matching historical UI labels (`S M T W T F S` / Nepali equivalents).

### Keyboard map

| Key | Behavior |
|-----|----------|
| Escape | Close popup; restore focus to input |
| ArrowLeft / ArrowRight | ±1 day (crosses month/year) |
| ArrowUp / ArrowDown | ±7 days |
| Home / End | First / last day of current week (Sun–Sat) |
| PageUp / PageDown | Previous / next BS month (nearest selectable day) |
| Enter | Select focused day if selectable (native button activation) |
| Space | Select focused day if selectable (explicit; prevents scroll) |
| Tab / Shift+Tab | Not trapped — natural tab order through header controls + one roving day cell |

Navigation keys apply only when a `.nepali-day` has focus (input editing preserved while open). Keys are ignored when closed. Arrow/Home/End/Page skip disabled / out-of-range dates.

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
| prev/next/month/year/calendar click | popup DOM | `setupCalendarEvents` | `teardownCalendarDom()` |
| Today / Clear click | popup DOM | `setupCalendarEvents` | `teardownCalendarDom()` |
| resize / scroll (capture) | `window` | while popup open | `detachPositionListeners()` via teardown/destroy |

No duplicate popup listeners across re-renders: teardown runs before each rebuild.

### Remaining accessibility limitations

- Not a full screen-reader certification — tests assert roles/names/DOM behavior only.
- `aria-modal="false"` by design (non-trapping); differs from assessment draft `true`.
- Disabled dates announce via `aria-disabled` + label suffix; not full live “unavailable” coaching.
- Visual redesign / stronger contrast tokens deferred to Stage 3.7.
- Input accessible **name** still depends on host page (`<label>` / `aria-label`); picker does not invent one.

### Remaining positioning limitations

- jsdom / mocked-geometry tests ≠ real-browser layout certification.
- Body attachment may still interact poorly with exotic `transform` / `filter` containing blocks on ancestors (rare); consumers can raise `zIndex` for overlays.
- Nested scroll containers are handled via capturing `scroll`, but visual subpixel differences vary by browser.
- No collision detection with unrelated overlays beyond the sticky z-index policy.

### Dual AD/BS display (Stage 3.6)

- BS grid remains the only selection model.
- Each day button: primary BS day + secondary AD day (`aria-hidden`); full AD in `aria-label`.
- Footer `.nepali-ad-equivalent` (`aria-live="polite"`) tracks the **focused** BS date.
- Digits follow `language` (`en` / `np`); AD month abbreviations stay Latin short form.
- Disabled BS dates still show AD text but stay non-selectable.
- **Deferred:** full AD calendar grid, AD month navigation, calendar-mode toggle.

### Theme tokens (Stage 3.7)

- Defaults and dark overrides live on `.nepali-datepicker` / `.nepali-datepicker-dark`.
- Consumer customization: set `--np-*` on the popup or an ancestor; keep `theme: "light"|"dark"`.
- No new public JS theme API.
- States use outline, inset bar (today), dashed border (disabled), and fill — not color alone.

### Missing product features

- Optional AD grid / calendar-system toggle (post–3.6, if authorized)
- `ui/` → `datepicker/` rename (when authorized)

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
