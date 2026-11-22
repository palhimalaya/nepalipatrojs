# Phase 4 — Integration & quality hardening assessment

**Date:** 2026-11-22  
**Authorization:** Assessment and documentation only — **no production-code changes**  
**Depends on:** Phase 3 CLOSED (datepicker redesign approved)  
**Related:** ISS-008, ISS-009, ISS-010, ISS-013, ISS-016, ISS-024; ADR-003, ADR-004, ADR-005

---

## Executive summary

NepaliPatroJS after Phases 0–3 is **algorithmically and UI-modularly strong under Jest**, but **not yet release-ready as a stable 2.0 public package** without further hardening.

| Area | Verdict |
|------|---------|
| Core conversion / exhaustive Jest | Strong (310/310; round-trips; timezone matrix) |
| Datepicker modularity (Phase 3) | Strong within agreed scope |
| Real-browser / AT verification | **Gap** — strategy needed; not certified |
| Mobile / touch / Nepali density | **Gap** — CSS suggests risk; needs measured browser evidence |
| Consumer docs vs Phase 3 API | **Gap** — `docs/api` ahead of README/QUICK_START |
| Packaging / CI honesty | **Blocking for trusted release** — known open issues |
| Dataset historical accuracy | **Unknown** (ISS-016) — do not claim |

**Priority recommendation:** Harden **integration evidence and consumer docs first**, then **packaging/CI (Phase 5)**. Defer React. Optionally authorize a **small mobile sizing CSS task** only after browser measurements confirm the token gaps.

Honest limit: **310 Jest tests ≠ browser compatibility, screen-reader certification, or historical BS accuracy.**

---

## 1. Real-browser testing strategy

### Current state (verified)

- Tests: Jest + jsdom only (`jest-environment-jsdom`). No Playwright/Cypress/Puppeteer in `package.json`.
- Positioning tests mock `getBoundingClientRect` / viewport — explicitly **not** real layout certification ([datepicker-architecture.md](datepicker-architecture.md)).
- Manual demos exist: `index.html`, `example/`, `test-datepicker.html`.
- Maintainer screenshots (2026-11-22) show EN + NE dual-label UI working visually in at least one browser session — anecdotal, not a matrix.

### Proposed browser smoke matrix

| ID | Scenario | Viewports | Themes | Locales | Pass criteria |
|----|----------|-----------|--------|---------|---------------|
| B1 | Open/close, select day, Clear, Today | 1280×800, 390×844 | light, dark | `en`, `ne` | Selection writes input; popup closes; Today/Clear behave |
| B2 | Keyboard: Esc, arrows, Home/End, PageUp/Down, Enter/Space | desktop | light | `en` | Focus visible; footer tracks focus; no trap on close |
| B3 | Positioning: near bottom/top/right edges; scroll parent | desktop | light | `en` | Popup stays in viewport; no clipped primary controls |
| B4 | Constraints: min/max/disabled + keyboard skip | desktop | light | `en` | Unavailable days not selectable |
| B5 | Dual display: BS primary, AD subtitle + footer | both | both | `en`, `ne` | Labels readable; footer matches focused |
| B6 | **Responsive hit targets** (see §1.1) | ≤480 CSS px width | light | `en`, `ne` | See checks below |
| B7 | Multi-instance + z-index / `setZIndex` | desktop | light | `en` | Stacking respects sticky z-index |
| B8 | UMD + CSS from built `dist/` in plain HTML | desktop | both | `en` | Global `NepaliDatePicker` + styles apply |

**Tooling recommendation (implementation later):** Playwright smoke against static `index.html` / a tiny fixture page; start with Chromium + one WebKit; Firefox optional. Keep Jest as the regression backbone.

**Not in first matrix:** full VoiceOver/NVDA certification (see §2).

### 1.1 Responsive / hit-target assessment (five authorized checks)

Evidence base: `src/ui/styles.css` tokens + DOM structure in `src/ui/render.ts` + maintainer screenshots. **No live device measurement in this assessment.**

| # | Check | Evidence | Finding | Risk |
|---|-------|----------|---------|------|
| 1 | **Actual clickable** day dimensions | Day control is a `<button class="nepali-day">` with fixed `width`/`height: var(--np-day-size)`. Gridcell is a wrapping `div`; click handler is on the button. | Hit area ≈ CSS day box, **not** the full grid column. Columns use `1fr` with `gap: 2px`; button uses `margin: 0 auto`. | Medium — dead space between columns if column > day-size; or squeeze if day-size > column |
| 2 | **44×44 mobile touch** | Desktop `--np-day-size: 42px`; `@media (max-width: 480px)` → **`38px`**. Action buttons `min-height: 36px`; nav `36×36`. | Mobile day **below** 44px guideline and below desktop. | **Medium–High** for touch |
| 3 | Weekday readability EN/NE | `.nepali-weekday` uses `--np-font-size-xs` (**10px**); mobile forces `10px`. Screenshots: Nepali abbreviations (आ, सो, …) look tight. | Below suggested 12–13px. | Low–Medium |
| 4 | Nepali numerals + dual BS/AD density | BS `14px` / mobile `13px`; AD `10px` / mobile **`9px`**; cell `gap: 1px`; dual stack in 38–42px height. Screenshots: readable but dense in `ne`. | Density risk at narrow + `ne`. | Low–Medium |
| 5 | Popup fit / overflow | `--np-popup-width: 328px` / mobile **`292px`**. Approx content width mobile ≈ 292 − 24 padding = 268px; 7 cols − 12px gaps ⇒ ~36.6px/col vs **38px** day → slight overflow pressure. | Possible horizontal squeeze/overflow on small screens — **needs measured DevTools check**. | Medium |

**Desktop 42px:** Acceptable; **keep unchanged** (maintainer decision).

**Disposition:** Do **not** change CSS in Phase 4 assessment. After browser smoke (B6), decide: fold mobile sizing into hardening **or** authorize a separate small UI token task.

---

## 2. Accessibility verification plan (assistive technology)

### Current state (verified)

- Phase 3.3 delivered: dialog/grid ARIA, roving `tabIndex`, `aria-selected` / `aria-disabled` / `aria-current`, live month region, focus restore, `:focus-visible` rings, keyboard module.
- Covered by jsdom tests (`a11y-keyboard.test.ts`, etc.).
- **ISS-013** remains **partial/open** until real AT testing.
- No claim of WCAG conformance is justified today.

### Proposed AT plan (manual first)

| Step | Activity | Tools | Exit criteria |
|------|----------|-------|---------------|
| A1 | Keyboard-only pass on B1–B5 | Chrome/Firefox | All actions reachable without pointer |
| A2 | Screen reader smoke | VoiceOver (Safari/macOS) **or** NVDA (Firefox/Windows) | Name/role/value for input, dialog, focused day, Today/Clear; Esc closes and restores focus |
| A3 | Contrast spot-check | DevTools / axe DevTools | Selected, today, disabled, AD subtitle distinguishable; document failures |
| A4 | Reduced-motion / zoom 200% | Browser | Popup usable; focus visible |

**Do not** treat automated axe-only as AT certification. Record findings under ISS-013; fix only under separate authorization.

---

## 3. Public API and documentation consistency

### Verified strengths

- Frozen inventory: [public-api-inventory.md](../api/public-api-inventory.md) (ISS-017).
- Detailed picker contract: [datepicker.md](../api/datepicker.md) — constraints, theme tokens `--np-*`, destroy/`setZIndex`.
- Facade `src/index.ts` still barrel-only; no unauthorized deep `nepalipatrojs/core` export.

### Gaps (docs drift after Phase 3)

| Surface | Gap |
|---------|-----|
| **README.md** | No `minDate` / `maxDate` / `disabledDates` / `isDateDisabled`; no date-only `convertAdToBs` / `convertBsToAd`; no `--np-*` customization; theme note still implies class-only customization |
| **QUICK_START.md** | Options table incomplete vs `datepicker.md`; React/Vue snippets are vanilla-wrapper examples only (fine) but omit constraints |
| **Class naming** | Docs mention `.nepali-datepicker-light` / `-dark`; implementation uses theme classes as built in Stage 3.7 — verify README matches actual class names during doc sync |
| **Consumer claim risk** | README does not warn that dataset provenance is unknown (ISS-016) |

### Recommendation

Authorize a **docs-only** sync task (README + QUICK_START ← `docs/api/*`) before or at the start of hardening implementation. No runtime API changes.

---

## 4. Calendar dataset provenance and accuracy risks (ISS-016)

### Verified facts

- Dataset + REF unchanged (ADR-003).
- Structural integrity + SHA-256 pin documented in core-engine docs.
- Exhaustive BS↔AD round-trips prove **internal consistency**, not civil/historical truth.
- Known external disagreement example (ISS-016): merokalam 2078-01-01 vs dataset+REF off by one day on that New Year sample.
- Path note: issue text still cites `src/constants/calendar-data.ts`; code lives under `src/core/calendar-data.ts` after Phase 2 — **docs path drift** only.

### Risks

| Risk | Impact |
|------|--------|
| Marketing / README implies “accurate Nepali calendar” without provenance | Trust / support burden |
| Replacing dataset without ADR-003 + dual verification | Silent breakage of goldens and consumer dates |
| Mixing “round-trip passed” with “historically correct” in release notes | Misleading 2.0 launch |

### Recommendation

Keep ISS-016 **open**. Before 2.0 release claims: add explicit **“provenance unknown / civil dataset”** wording to README and API docs. Research upstream attribution as a parallel non-blocking track. **No dataset replacement** in Phase 4.

---

## 5. Build artifacts and package compatibility (inspect only)

### Verified 2026-11-22 (post-build workspace)

| Artifact / field | Result |
|------------------|--------|
| `dist/nepali-patro-js.esm.js` / `.umd.js` / `.css` | Present |
| `dist/index.d.ts` | **Present after local build** |
| `exports["./css"]` → `nepali-patro-js.css` | OK |
| `exports["./styles"]` → `only-styles.css` | **MISSING** (ISS-009); `dist/only-css.js` is a 1-byte stub, not CSS |
| `npm pack --dry-run` | Packs `dist/` tree including many `.d.ts` (87 files, ~85 kB tarball) when built locally |
| `.gitignore` | Ignores most of `dist/*` except umd/esm/css — declarations not tracked in git |
| CI `.github/workflows/ci.yml` | `continue-on-error: true` on **build** and **test** (ISS-010) |
| `types` / `exports.types` | Point at `dist/index.d.ts` — OK if `prepublishOnly` build succeeds; fragile if publish without build |

### Packaging risk register (no fixes applied)

| ID | Issue | Severity | Notes |
|----|-------|----------|-------|
| P-ISS-009 | Broken `./styles` | High | Consumer import fails |
| P-ISS-010 | CI continues on error | High | Green CI can hide failures |
| P-ISS-008 | Types publish story | Medium–High | Emit works locally; gitignore + pack smoke still needed |
| P-CACHE | CI caches `dist/` by `src/**/*.ts` hash | Medium | May stale CSS-only changes if key omits CSS — verify in Phase 5 |
| P-FILES | `files: ["dist"]` ships whole dist | Low–Medium | Includes maps / internal `.d.ts` — decide public types surface in Phase 5 |

**Do not change packaging in this assessment.** Phase 5 remains the implementation home.

---

## 6. Risk register (prioritized)

| ID | Risk | Severity | Likelihood | Mitigation direction |
|----|------|----------|------------|----------------------|
| R1 | Publish with broken `./styles` / soft CI | High | High | Phase 5: ISS-009, ISS-010, pack smoke |
| R2 | Mobile touch targets < 44px; dense `ne` UI | Medium | High | Browser B6 → optional CSS task |
| R3 | README under-documents Phase 3 API | Medium | High | Docs sync task |
| R4 | No real-browser regression net | Medium | High | Playwright (or manual) matrix B1–B8 |
| R5 | AT gaps undiscovered (ISS-013) | Medium | Medium | Manual AT plan A1–A4 |
| R6 | Historical accuracy claims (ISS-016) | Medium | Medium | Honest docs; no dataset swap |
| R7 | Hit area ≠ full grid cell | Low–Medium | Medium | Measure in B6; CSS only if needed |
| R8 | ISS-024 footer ≠ hover | Low | Certain | Accepted; document in consumer docs |
| R9 | React pressure before vanilla stable | High (process) | Medium | Keep deferred |

---

## 7. Proposed test matrix (summary)

| Layer | Keep / add | Purpose |
|-------|------------|---------|
| Jest (jsdom) | **Keep** — 310 tests | Unit/integration regressions |
| Exhaustive conversion | **Keep** | Algorithmic consistency |
| Architecture boundary | **Keep** | core/i18n/ui rules |
| Browser smoke | **Add** (Phase 4 impl) | B1–B8 |
| AT manual | **Add** checklist | A1–A4 |
| `npm pack` install smoke | **Add** (Phase 5) | Exports, types, CSS |
| CI fail-on-error | **Add** (Phase 5) | Honesty |

---

## 8. Recommended implementation sequence

Authorize **separately**; assessment does not start these.

| Order | Task | Type | Rationale |
|-------|------|------|-----------|
| **4.1** | Consumer docs sync (README / QUICK_START / ISS-016 honesty) | Docs only | Fast; reduces API confusion |
| **4.2** | Real-browser smoke harness + execute B1–B8 (incl. five responsive checks) | Test infra + evidence | Decides CSS follow-up with measurements |
| **4.3** | AT manual pass (A1–A4); update ISS-013 | Manual + docs | Closes accessibility uncertainty |
| **4.4** | Optional mobile sizing CSS (tokens only) | Small UI | **Only if 4.2 confirms**; else skip |
| **5.x** | Packaging / CI / pack smoke (ISS-008/009/010) | Phase 5 | Release honesty after integration evidence |
| **Later** | React integration | Phase deferred | After vanilla package stable |
| **Parallel** | ISS-016 provenance research | Docs / research | Non-blocking; no dataset replace |
| **Deferred** | `ui/` → `datepicker/` rename; full AD grid | Structural / feature | Explicitly out of hardening |

### What should wait

- React
- Packaging code changes until 4.1–4.2 at least scoped (or run 5.x immediately after 4.1 if release pressure dominates — maintainer call)
- Dataset replacement
- Visual redesign beyond optional mobile tokens

---

## 9. Explicit non-goals (this assessment)

- No production TypeScript/CSS/JS changes
- No packaging / export / CI edits
- No React
- No dataset changes
- No AD grid / mode switch
- No `ui/` rename

---

## 10. Suggested next authorization

**Authorize Phase 4.1 — consumer documentation sync** (docs only), and/or **Phase 4.2 — browser smoke strategy implementation** (tests/fixtures only; still no datepicker behavior changes).

Bring findings from 4.2 before authorizing any CSS sizing follow-up.

---

## 11. Stage 4.1 outcome (2026-11-22)

**Status:** Completed (docs only). Production code / package / CI / CSS / tests **unchanged**.

Delivered: README + QUICK_START sync; ISS-016 honesty in consumer docs; ISS-005 documented; API docs (`datepicker`, `conversion`, `formatting`) updated; inventory option table refreshed.

**Next:** Maintainer review → authorize **Stage 4.2** browser smoke.

---

## 12. Stage 4.2 outcome (2026-11-22)

**Status:** Completed (smoke only). See [phase4-browser-smoke-results.md](phase4-browser-smoke-results.md).

Measured mobile day **38×38** (vs 44 target); popup **292** fits 390-wide viewport. Desktop **42×42** keep. ISS-025 nested scroll filed. **Recommend Stage 4.4** mobile CSS; 4.3 AT still pending auth.
