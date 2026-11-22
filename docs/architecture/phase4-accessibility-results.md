# Phase 4.3 — Manual accessibility testing results

**Date:** 2026-11-22  
**Authorization:** Assessment / testing / documentation only — **no implementation fixes**  
**OS:** Linux Fedora 44 (`x86_64`), Wayland (`wayland-1`)  
**Fixture:** `smoke-phase42.html` + built `dist/` UMD/CSS  
**Related:** ISS-013, Stage 4.2 smoke report

**Honesty rule:** This is **not** WCAG certification. Screen-reader **speech** was not verified in this session.

---

## 1. Environments actually tested

| Environment | Available? | Used? | Result class |
|-------------|------------|-------|--------------|
| Keyboard-only — Cursor IDE browser (Chromium/Electron 150) | Yes | **Yes** | Primary evidence |
| ARIA / DOM inspection (same browser via CDP) | Yes | **Yes** | Structural evidence |
| Approximate contrast (sRGB relative luminance from computed styles) | Yes | **Yes** | Spot-check only |
| Visual state CSS inspection (`:focus-visible`, dashed disabled, today inset) | Yes | **Yes** | Visual evidence |
| **NVDA** + Firefox/Chrome (Windows) | **No** | — | **NOT TESTED** |
| **VoiceOver** + Safari (macOS/iOS) | **No** | — | **NOT TESTED** |
| **Orca** 50.3 (installed on host) | Yes (package present) | **Speech not exercised** | **NOT TESTED** (no reliable capture of spoken output in agent session; AT-SPI Python bindings absent) |
| Physical mobile AT / TalkBack / VoiceOver iOS | **No** | — | **NOT TESTED** |
| Firefox interactive keyboard suite | Partial (host has Firefox) | Not re-run in 4.3 | Covered under IDE Chromium keyboard |

Layer tags used below:

- `keyboard` — real key handling / focus in browser  
- `aria-dom` — attributes and tree structure (not spoken output)  
- `visual` — CSS / contrast math  
- `sr-speech` — actual AT announcement (none in this stage)

---

## 2. Manual scenario results

### A — Input and popup

| ID | Scenario | Layer | Result | Evidence |
|----|----------|-------|--------|----------|
| A1 | Input has accessible name | aria-dom | **PASS** | `<label for="en-light">EN light (basic)</label>` |
| A2 | `aria-haspopup=dialog`, `aria-expanded` toggles, `aria-controls` → popup id | aria-dom | **PASS** | Expanded `false`→`true` on open |
| A3 | Popup `role=dialog` with label | aria-dom | **PASS** | EN: `Choose date`; NP: `मिति छान्नुहोस्`; `aria-modal=false` (non-modal by design) |
| A4 | Focus enters a day on open | keyboard | **PASS** | `activeElement` = `.nepali-day` with full `aria-label` |
| A5 | Escape closes + restores input focus | keyboard | **PASS** | Popup gone; `aria-expanded=false`; focus on input |

### B — Calendar navigation

| ID | Scenario | Layer | Result | Evidence |
|----|----------|-------|--------|----------|
| B1 | Grid + live month region | aria-dom | **PASS** | `role=grid` + `aria-labelledby` live id; live `aria-live=polite` |
| B2 | Weekday row decorative | aria-dom | **PASS** | `.nepali-weekdays` `aria-hidden=true` |
| B3 | Day accessible name includes BS (+ AD suffix) | aria-dom | **PASS** | e.g. `6 Mangsir 2083, AD 22 Nov 2026` |
| B4 | Visual AD numeral hidden from AT | aria-dom | **PASS** | `.nepali-day-ad` `aria-hidden=true` (AD still in button name) |
| B5 | Footer polite live for focused AD | aria-dom | **PASS** | `aria-live=polite`; text updates with focus |
| B6 | Month change updates live text | aria-dom | **PASS** | `Mangsir 2083` → `Poush 2083` after PageDown |
| B7 | Arrow keys move focus | keyboard | **PASS** | Label day 6 → 7 |
| B8 | SR announcement of navigation | sr-speech | **NOT TESTED** | — |

### C — Date states

| ID | Scenario | Layer | Result | Evidence |
|----|----------|-------|--------|----------|
| C1 | Disabled named unavailable | aria-dom | **PASS** | `… (unavailable)`; `aria-disabled=true` on button + gridcell |
| C2 | Today `aria-current=date` | aria-dom | **PASS** | On today’s gridcell when present |
| C3 | Selected `aria-selected=true` | aria-dom | **PASS** | On **gridcell** (not on the named button) — see risk R2 |
| C4 | Today / Clear names | aria-dom | **PASS** | `Today` / `Clear`; NP `आज` / `खाली` |
| C5 | Disabled not selectable | keyboard | **PASS** | (also Stage 4.2) |
| C6 | SR announces selected/today/disabled | sr-speech | **NOT TESTED** | — |

### D — Localization

| ID | Scenario | Layer | Result | Evidence |
|----|----------|-------|--------|----------|
| D1 | NP day label + Devanagari | aria-dom | **PASS** | `६ मंसिर २०८३, ईस्वी २२ Nov २०२६` |
| D2 | NP dialog + actions + live month | aria-dom | **PASS** | `मिति छान्नुहोस्`; `आज`/`खाली`; live `मंसिर २०८३` |
| D3 | Dual AD duplicate-announcement risk | note | **RISK** | AD in `aria-label` **and** polite footer — may double-speak; needs SR |
| D4 | SR quality of Nepali digits/names | sr-speech | **NOT TESTED** | Voice engines vary for Devanagari |

### E — Focus and dismissal

| ID | Scenario | Layer | Result | Evidence |
|----|----------|-------|--------|----------|
| E1 | Tab not trapped (no preventDefault) | keyboard | **PASS** | Synthetic Tab `defaultPrevented=false`; matches jsdom suite |
| E2 | Selection restores input focus | keyboard | **PASS** | `activeElement` = input after day click |
| E3 | Destroy while open — no detached focus | keyboard | **PASS** | Popup removed; `activeElement.isConnected`; input ARIA restored |
| E4 | Full Tab order through page chrome | keyboard | **PARTIAL** | Not fully walked manually beyond “not trapped” |
| E5 | SR focus tracking | sr-speech | **NOT TESTED** | — |

### F — Visual accessibility

| ID | Scenario | Layer | Result | Evidence |
|----|----------|-------|--------|----------|
| F1 | `:focus-visible` rule present for days | visual | **PASS** | CSSOM contains `.nepali-day:focus-visible` |
| F2 | Disabled not color-only | visual | **PASS** | `border-style: dashed` + opacity `0.42` |
| F3 | Today not color-only | visual | **PASS** | Inset accent bar (CSS / prior screenshots); spot re-query flaky when today node absent |
| F4 | Selected not color-only | visual | **PASS** | Fill + stronger border (`accent-strong`) |
| F5 | Body text contrast (light) | visual | **PASS\*** | ~**11.99:1** body on surface (\*approx.) |
| F6 | AD subtitle contrast (light) | visual | **FAIL\*** | ~**2.26:1** (+ opacity 0.62) — **ISS-026** |
| F7 | Selected text contrast (light) | visual | **FAIL\*** | White on `#4299e1` ~**3.05:1** — **ISS-027** |
| F8 | Dark theme selected / AD | visual | **BORDERLINE\*** | Selected ~4.03; AD ~4.06 (under 4.5 normal-text AA) |
| F9 | Touch targets | note | **Known gap** | Stage 4.2: mobile **38×38** vs 44 — Stage 4.4 |

\*Contrast values are approximate sRGB relative luminance from `getComputedStyle`, **not** a certified audit tool.

---

## 3. Screen-reader findings

| AT | Status |
|----|--------|
| NVDA | **NOT TESTED** (Windows not available) |
| VoiceOver | **NOT TESTED** (macOS/iOS not available) |
| Orca | **NOT TESTED** for speech (installed 50.3; no AT-SPI automation / speech capture in this session) |

**Do not interpret aria-dom PASS rows as “screen reader works.”**

Structural risks for future SR sessions:

1. **R1 — Dual AD live:** Button `aria-label` already includes AD; footer also `aria-live=polite` → possible redundant announcements.  
2. **R2 — Selected state placement:** `aria-selected` on `role=gridcell` wrapper; accessible **name** on child `<button>` without `aria-selected`. Some SRs may not clearly expose “selected” with the name.  
3. **R3 — Non-modal dialog:** `aria-modal=false` matches outside-click UX; focus can move to page chrome while open (by design, not a bug — document for AT users).

---

## 4. Keyboard and focus findings

Strengths: open focuses a day; arrows/Page move; Escape restores input; Space/click select restore input; destroy cleans ARIA/focus; Tab not trapped.

Gaps: full manual Tab circuit through month/year `<select>` + actions not exhaustively timed; Enter relies on native button activation (known from Stage 3.3).

---

## 5. English / Nepali localization findings

EN and NP **DOM labels** look coherent (dialog, live month, day names, actions, disabled suffix `unavailable` / `अक्षम`).

NP day label mixes Devanagari BS with Latin month abbreviation in AD suffix (`Nov`) — acceptable for bilingual AD, but SR pronunciation of mixed script is unverified.

---

## 6. Remaining accessibility risks

| ID | Risk | Severity | Track |
|----|------|----------|-------|
| ISS-026 | Light-theme AD subtitle contrast ~2.3:1 | **High** (readability) | Fix in visual/token work (can share Stage 4.4) |
| ISS-027 | Light selected white-on-blue ~3.05:1 | **Medium–High** | Token/color tweak (4.4 or separate) |
| R1 | Possible double AD announcement | Medium (unverified) | Needs SR session |
| R2 | `aria-selected` on gridcell vs named button | Medium (unverified) | Needs SR; possible markup fix later |
| Mobile 38px targets | Touch a11y | Medium | Stage 4.4 |
| No NVDA/VO evidence | Release risk | High for “accessible” claims | Keep ISS-013 open |
| ISS-025 | Nested scroll | Medium | Separate positioning fix |

---

## 7. ISS-013 status recommendation

**Keep ISS-013 open (partial).**

- **Advanced:** Keyboard behavior and ARIA scaffolding verified in a real Chromium-based browser (not only jsdom).  
- **Still missing:** NVDA, VoiceOver, and Orca **speech** confirmation; contrast defects found (ISS-026/027).  
- **Do not** mark resolved or claim WCAG conformance.

---

## 8. Implication for Stage 4.4

Accessibility findings **do not block** the planned mobile sizing refinement:

- Desktop 42px remains fine.  
- Mobile → ~44px still recommended.  
- Weekday ~12px / AD readability improvements **align with ISS-026** (raising AD contrast/size helps both density and contrast).  
- Selected-state contrast (ISS-027) may be addressed in the same token pass **if** authorized to touch accent/selected colors; otherwise keep 4.4 sizing-only and schedule ISS-027 separately.

No broader redesign required before 4.4 from this stage’s evidence.

---

## 9. Production boundary

No changes to `src/`, CSS sources, tests, package metadata, CI, dependencies, or calendar dataset.

---

## 10. Exact next task

Await maintainer review → authorize **Stage 4.4** mobile CSS (and optionally ISS-026/027 token contrast in the same or follow-on auth). Schedule a human SR session (NVDA or VoiceOver) before any “accessible datepicker” release claim. ISS-025 remains separately scoped.
