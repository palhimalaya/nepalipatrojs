# Phase 4.2 — Real-browser smoke results (B1–B8)

**Date:** 2026-11-22  
**Authorization:** Stage 4.2 only — **no production fixes**  
**OS:** Linux Fedora 44 (`x86_64`)  
**Fixture:** `smoke-phase42.html` (temporary, untracked) + built `dist/` UMD/CSS  
**Evidence dir:** `.smoke-evidence/` (local artifacts; screenshots under `.smoke-evidence/screenshots/`)

---

## 1. Browser / tool availability

| Tool | Available? | Used? | Notes |
|------|------------|-------|-------|
| Chromium 157 (system) | Yes | Yes (headless desktop measure) | Narrow `--window-size=390` did **not** apply CSS viewport (stayed ~500px / `matchMobileMq: false`) |
| Cursor IDE browser (Chromium/Electron 150, Cursor 3.30.14) | Yes | **Primary** | CDP `Emulation.setDeviceMetricsOverride` for true 390×844 @ DPR 2 |
| Firefox 160 | Yes | Partial | Headless screenshot with dedicated profile; interactive automation blocked by existing Firefox session |
| Playwright / Puppeteer | **No** | — | Not in package; install forbidden |
| WebKit / Safari | **No** | — | Epiphany/Web 50.6 present; not automated |
| Physical device / real touch hardware | **No** | — | Touch = CDP mobile emulation only |

**Method legend:** `IDE` = Cursor browser automation · `CH` = Chromium headless · `FF` = Firefox headless screenshot · `EMU` = device metrics emulation (not a physical phone)

---

## 2. Viewport matrix

| Label | Width×Height | DPR | Mobile MQ (≤480) | Method |
|-------|--------------|-----|------------------|--------|
| Desktop IDE | 1189×900 | 1 | false | IDE |
| Desktop Chromium | 1280×657 (inner) | 1 | false | CH dump-dom |
| Mobile emulated | **390×844** | **2** | **true** | IDE + CDP Emulation |
| Firefox desktop shot | ~1280×800 | — | — | FF screenshot only |

---

## 3. Responsive measurements (B4) — actual geometry

Measured via `element.getBoundingClientRect()` on the **day `<button class="nepali-day">`** after open (not CSS token alone).

| Element | Viewport | Actual dimensions | Expected target | Result |
|---------|----------|-------------------|-----------------|--------|
| Day button | Desktop (IDE / CH) | **42 × 42 px** | 40–44 px | **PASS** (keep) |
| Day button | Mobile 390 CSS px (IDE EMU) | **38 × 38 px** | ≥44 × 44 preferred | **SHORTFALL (−6 px)** |
| Weekday label | Desktop | font-size **10px**; cell ~42×29 | 12–13 px recommended | Below target; no clipping observed |
| Weekday label | Mobile | font-size **10px**; cell ~38×29 | Readable / no clip | Readable; tight (EN + NP) |
| AD subtitle | Desktop | font-size **10px**; ~11×11 box | Secondary ok | PASS |
| AD subtitle | Mobile | font-size **9px**; ~10×10 box | Readable without crowding | Dense but legible in screenshot |
| Popup | Desktop | **328 × ~478 px** | — | PASS |
| Popup | Mobile | **292 × ~446 px**; left 33, right 325 | Fits 390-wide viewport | **Fits**; `overflowX: false` |
| CSS tokens (mobile) | Mobile | `--np-day-size: 38px`; `--np-popup-width: 292px` | Matches measured | Confirmed |
| Nav button | Mobile | **36 × 36 px** | 36–40 | At low end of range |

### Hit-area note

Interactive target is the **button**, not the full `1fr` grid column (`margin: 0 auto` on the day). Measured button size ≈ token size.

### Column squeeze check (mobile)

Popup content width ≈ 292 − 24 padding = 268px; 6×2px gaps → ≈36.6px/column vs **38px** day button. No document `overflowX` observed at 390px; slight internal tightness possible but no horizontal page scroll in this run.

---

## 4. B1–B8 results summary

| ID | Area | Result | Method | Notes |
|----|------|--------|--------|-------|
| B1 | Open / select / change / reopen / destroy | **PASS** | IDE | Select wrote `2083-08-10`, closed popup, `change` fired; destroy blocks reopen |
| B1 | Today | **PASS** (retest) | IDE | Fresh instance → `2083-08-06`, popup closed |
| B1 | Clear | **PASS** | IDE | Value `""`, popup stays open |
| B1 | Single open popup | **PASS** | IDE | Only one `.nepali-datepicker` at a time |
| B2 | Below input | **PASS** | IDE | Popup top below input bottom |
| B2 | Flip above near bottom | **PASS** | IDE | Popup placed above input near viewport bottom |
| B2 | Horizontal clamp | **PASS** | IDE | Right-edge input; popup `right` ≤ viewport |
| B2 | Nested scroll reposition | **FAIL / limitation** | IDE | Nested `overflow:auto` scroll did **not** move popup (see ISS-025) |
| B2 | Window resize | **NOT TESTED** | — | Not exercised in this run |
| B3 | Mobile fit / no overflow | **PASS** | IDE EMU | Popup inside 390×844; no `overflowX` |
| B3 | Touch select | **PASS (emulated)** | IDE EMU | Click/tap on day works under mobile metrics — **not** physical touch hardware |
| B4 | Five sizing checks | **PASS with findings** | IDE EMU + CH | See measurement table; mobile 38px shortfall |
| B5 | EN + NP (`np`) | **PASS** | IDE | NP dark: Devanagari weekdays, `आज`/`खाली`, Nepali aria-label sample |
| B6 | Light / dark themes | **PASS** | IDE + screenshots | `.nepali-datepicker-light` / `-dark`; states visually distinct in screenshots — **no formal contrast audit** |
| B7 | Arrows + footer sync | **PASS** | IDE | Footer `22 Nov` → `24 Nov` with focus move |
| B7 | Escape | **PASS** | IDE | Closes popup |
| B7 | Home / End / PageDown / PageUp | **PASS** | IDE | PageUp works when focus is on a day button (handler requires `activeElement.nepali-day`) |
| B7 | Space select | **PASS** | IDE | Selects and closes |
| B7 | Enter | **PARTIAL** | IDE | Relies on native button activation; synthetic Enter alone inconclusive |
| B7 | Tab order | **NOT TESTED** | — | Deferred to Stage 4.3 AT |
| B8 | Constraints / disabled | **PASS** | IDE | Day-1 disabled via predicate; click does not change value |
| B8 | Dual AD `data-ad` | **PASS** | IDE | Present on day buttons |
| B8 | ISS-024 hover vs focus | **PASS** | IDE | Footer unchanged on `mouseover` |

---

## 5. Screenshots / evidence

| File | Content |
|------|---------|
| `.smoke-evidence/screenshots/page-2026-11-22T07-05-31-576Z.png` | Desktop EN light open |
| `.smoke-evidence/screenshots/page-2026-11-22T07-05-52-804Z.png` | Mobile-emulated EN light |
| `.smoke-evidence/screenshots/page-2026-11-22T07-06-04-840Z.png` | NP dark theme |
| `.smoke-evidence/firefox-desktop.png` | Firefox headless page shot |
| `.smoke-evidence/desktop-en.json` | Chromium headless desktop measure |
| `.smoke-evidence/measure-mobile-390.json` | IDE mobile measure summary |

---

## 6. Defects / findings (no fixes applied)

### ISS-025 — Nested scroll containers do not reposition popup

- **Severity:** medium  
- **4.2 evidence:** Nested `overflow:auto` scrolled; popup `top` unchanged (58.28 → 58.28).  
- **Cause:** `window` scroll (even capture) does not receive element scroller events.  
- **Later fix (2026-11-22):** Ancestor scroll listeners via `collectScrollableAncestors`; IDE re-check on fixture showed `style.top` update after nested scroll. **Resolved** (maintainer close; browser coverage limited, accepted).

### Mobile touch target shortfall (feeds Stage 4.4 decision)

- **Severity:** medium (usability)  
- **Evidence:** Measured **38×38** day buttons at 390 CSS px / DPR 2 vs **44×44** preference (−6 px). Tokens match (`--np-day-size: 38px`).  
- **Not a functional blocker** for mouse/emulated tap in this run.  
- **Recommendation:** Authorize **Stage 4.4** for mobile token bump (e.g. day ≥44, revisit weekday 10→12, AD 9→10/11) while **keeping desktop 42px**.

### Not defects

- ISS-024 confirmed (footer ignores hover).  
- PageUp initially looked broken under harness; **PASS** when day button focused.

---

## 7. Recommendation on Stage 4.4

**Recommend authorizing Stage 4.4 (narrow mobile CSS)** after maintainer review:

| Change idea | Why |
|-------------|-----|
| Raise mobile `--np-day-size` toward **44px** | Measured 38px shortfall |
| Consider mobile weekday ≥12px | Measured 10px |
| Consider mobile AD subtitle ≥10px | Measured 9px |
| Re-check popup width if day size grows | Avoid new overflow |
| **Do not change desktop 42px** | Measured acceptable |

Popup **292px fits** 390-wide viewport today — width is secondary to hit-target size.

---

## 8. Remaining unverified

- Safari / iOS WebKit  
- Physical phones / real touch  
- Firefox interactive keyboard suite  
- Window resize reposition  
- Formal contrast / AT (Stage 4.3)  
- Host-page CSS leakage stress tests beyond this fixture  
- Multi-instance concurrent opens with different z-index stress  

---

## 9. Production boundary confirmation

No changes to: `src/`, CSS theme tokens (source), `package.json`, lockfiles, CI, build config, calendar dataset, or tests.

Temporary artifacts only: `smoke-phase42.html`, `.smoke-evidence/`, `.smoke-chrome-profile*`, `.smoke-firefox-profile/`.

---

## 10. Exact next task

**Await maintainer review of Stage 4.2.** Suggested priority after review:

1. **Stage 4.4** mobile sizing CSS (evidence-backed), **or**  
2. **Stage 4.3** manual AT — if a11y is preferred before visual tweaks  

Also schedule a follow-up (not 4.4) for **ISS-025** nested scroll positioning.
