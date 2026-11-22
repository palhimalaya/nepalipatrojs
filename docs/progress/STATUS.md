# Project status

**Last updated:** 2026-11-22  
**Current published version:** 1.0.5  
**Target version:** 2.0.0  
**Current phase:** Phase 3 — Datepicker redesign **CLOSED**  
**Phase 0 / 1 / 2 / 3:** CLOSED  

## Completion

| Phase / step | Status |
|--------------|--------|
| Phase 0 — Audit & docs bootstrap | CLOSED |
| Phase 1 — Core correctness | CLOSED |
| Phase 2 — Architecture / boundaries | CLOSED |
| Phase 3 Stages 3.0–3.7 — Datepicker redesign | **CLOSED** (maintainer approved 2026-11-22) |
| Phase 4 — Integration & quality hardening | **NOT AUTHORIZED** (assessment recommended) |

## Phase 3 close-out verdict

| Stage | Scope | Verdict |
|-------|-------|---------|
| 3.1 | State and calendar grid | Approved |
| 3.2 | Safe DOM rendering | Approved |
| 3.3 | Keyboard and accessibility | Approved |
| 3.4 | Positioning and z-index | Approved |
| 3.5 | Today, constraints, disabled dates | Approved |
| 3.6 | Dual AD/BS display | Approved |
| 3.7 | Theme tokens and visual refinement | Approved |

**Verification at close:** Jest **310/310**, `tsc --noEmit` PASS, `npm run build` PASS.

**Honest limits:** 310 Jest tests do **not** establish browser compatibility, screen-reader certification, or historical accuracy of the BS dataset.

## Carry-forward issues

| Issue | Status | Recommendation |
|-------|--------|----------------|
| ISS-013 — Accessibility limitations | Partial / open | Keep open until real assistive-technology testing |
| ISS-016 — Calendar dataset provenance | Open | Important before claiming historical accuracy |
| ISS-024 — Footer tracks focus, not hover | Accepted limitation | No immediate fix required |
| `ui/` directory naming | Deferred | Future structural cleanup |
| Real-browser visual verification | Not completed | Browser smoke tests in a later testing stage |

## Datepicker sizing decision (2026-11-22)

Screenshot + CSS review: **no CSS follow-up now.** Desktop day cells (`42px`) kept. Mobile/localization gaps deferred into Phase 4 assessment (38px mobile day, 10px weekdays, 292px mobile popup, Nepali dual-label density).

## Recommended next (not authorized until prompt)

**Phase 4 — Integration and quality hardening assessment** (assessment only):

1. Real-browser testing strategy (keyboard, positioning, responsive layout, themes)
2. Accessibility verification with actual assistive technology
3. Public API and documentation consistency after the redesign
4. Calendar dataset provenance and accuracy risks
5. Build artifacts and package compatibility — inspect only; do not change packaging yet
6. Responsive hit-target / localization density checks (see MASTER-PLAN)

Former “Phase 4 React” and “Phase 5 packaging” remain deferred until this assessment chooses priorities. No React, packaging, CSS sizing, or new calendar interaction model without separate auth.

## Next exact task

**Await Phase 4 assessment prompt / authorization.** No CSS changes. No implementation.
