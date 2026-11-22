# Project status

**Last updated:** 2026-11-22  
**Current published version:** 1.0.5 (npm)  
**Repo package version:** 2.0.0  
**Target version:** 2.0.0  
**Current phase:** Phase 5 — Stages **5.1–5.6 implemented** (awaiting maintainer close / release auth)  
**Phases 0–3 / Stages 4.1–4.4:** CLOSED

## Completion

| Phase / step | Status |
|--------------|--------|
| Stages 4.1–4.4 | **CLOSED** |
| Stage 5.1 CI honesty | **CLOSED** (ISS-010) |
| Stages 5.2–5.6 | **Implemented** — await close review |
| ISS-008 / 009 / 010 / 028 | **Resolved** |
| ISS-025 / 026 / 027 | Resolved |
| ISS-013 | Open — SR speech still missing |
| npm publish 2.0.0 | **Not authorized** |
| React | Deferred |

## Phase 5 implementation notes

- **5.3:** CJS `dist/nepali-patro-js.cjs` — `require` works
- **5.2:** `./styles` aliases `./css`
- **5.4:** Bundled `dist/index.d.ts`; clean dist; allowlisted `files`
- **5.5:** `pack:smoke` + CI typecheck/pack gates; publish workflow gated
- **5.6:** Version `2.0.0`, migration guide, README/metadata updated — **publish not done**

## Next exact task

**Await close review** of Stages 5.2–5.6. Separate authorization required before npm publish / GitHub release. ISS-013 and React unchanged.
