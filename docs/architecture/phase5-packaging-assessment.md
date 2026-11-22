# Phase 5 — Packaging and CI Assessment

**Date:** 2026-11-22  
**Authorization:** Assessment only — **no implementation**  
**Current published version:** `nepalipatrojs@1.0.5`  
**Workspace version field:** still `1.0.5` (2.0 not cut)

---

## 1. Executive summary

The library’s conversion and datepicker engineering are largely ready for a 2.0 *product* story, but **distribution is not release-honest**.

Highest blockers:

1. **`require('nepalipatrojs')` returns an empty object** under the current `"type": "module"` + UMD-as-`.js` `exports.require` setup (verified via `npm pack` → clean install).
2. **`nepalipatrojs/styles` is a broken export** (`dist/only-styles.css` does not exist) — ISS-009; also present on the live npm package.
3. **CI can stay green when build/test fail** (`continue-on-error: true`) — ISS-010.
4. **Types publish story is fragile** — local builds emit a deep `.d.ts` graph; git ignores most of `dist/`; published `1.0.5` ships an incomplete/stale declaration set relative to today’s source layout — ISS-008.

ESM `import` from the packed tarball **works** for JS runtime. CSS via `nepalipatrojs/css` **resolves** for bundlers/link tags; raw Node `import` of `.css` fails as expected without a loader.

**Recommendation:** Implement Phase 5 in small approved stages (below). Do not publish 2.0 until blockers P0–P1 are fixed and pack-smoke is green. React remains deferred. ISS-013 remains separate.

---

## 2. Method (read-only)

Inspected without modifying package/CI/source:

| Source | What |
|--------|------|
| `package.json`, `rollup.config.js`, `tsconfig.json`, `.gitignore` | Config |
| `.github/workflows/ci.yml`, `npm-publish.yml` | CI/publish |
| Local `dist/` after existing build | Artifacts |
| `npm pack --dry-run` + `/tmp` install smoke | Consumer simulation |
| `npm pack nepalipatrojs@1.0.5` | Live registry contents |
| Open issues ISS-008 / 009 / 010; `docs/architecture/packaging.md`; Phase 4 packaging notes | Prior debt |

No production code, dependency, package.json, or CI edits were made in this assessment.

---

## 3. Current packaging inventory

### 3.1 `package.json` fields

| Field | Value | Assessment |
|-------|-------|------------|
| `name` / `version` | `nepalipatrojs` / `1.0.5` | Version not yet bumped for 2.0 |
| `type` | `module` | Interacts badly with UMD `.js` `require` entry (see §4) |
| `main` | `dist/nepali-patro-js.umd.js` | Intended CJS/UMD; broken in Node require smoke |
| `module` | `dist/nepali-patro-js.esm.js` | OK for bundlers |
| `types` | `dist/index.d.ts` | Present after local build; publish completeness weak |
| `exports["."]` | `import` → ESM, `require` → UMD, `types` → `index.d.ts` | `types` not first; `require` broken in smoke |
| `exports["./css"]` | `./dist/nepali-patro-js.css` | File exists; OK for bundlers / `<link>` |
| `exports["./styles"]` | `./dist/only-styles.css` | **MISSING file** (ISS-009) |
| `files` | `["dist"]` | Packs entire `dist/` including maps, stubs, stale trees |
| `dependencies` | `tslib` only | OK |
| `scripts` | `build`, `dev`, `test`, `prepublishOnly` | **No `typecheck`**; no pack smoke |
| `sideEffects` | unset | Bundlers may tree-shake CSS side effects incorrectly |
| `author` / `engines` | empty / unset | Polish / support clarity |

### 3.2 Build outputs (Rollup)

| Output | Role | Notes |
|--------|------|-------|
| `dist/nepali-patro-js.esm.js` (+ map) | ESM bundle | Runtime import OK in pack smoke |
| `dist/nepali-patro-js.umd.js` (+ map) | UMD; global `NepaliPatro` | Browser CDN OK; Node `require` via exports **fails** (empty module) |
| `dist/nepali-patro-js.css` | Extracted styles | Produced by main + CSS-only builds (same extract name) |
| `dist/only-css.js` | 1-byte stub | Not a useful consumer artifact |
| `dist/only-styles.css` | Declared by `./styles` | **Never built** |
| `dist/index.d.ts` + deep graph | Declarations from `@rollup/plugin-typescript` | `rollup-plugin-dts` imported in config but **unused** |
| Legacy/stale dirs under `dist/` | `constants/`, `converters/`, `utils/`, `__tests__/`, … | Can accumulate; inflate pack; confuse types |

`.gitignore` allowlists only `dist/nepali-patro-js.{css,umd.js,esm.js}` — declarations/maps are local build products, not git-tracked.

### 3.3 What npm `1.0.5` actually contains

Published tarball: **27 paths**. Includes ESM/UMD/CSS + a **partial, older-shaped** `.d.ts` set (`./types`, `./converters`, …). Does **not** include today’s `core/` / `i18n/` declaration layout. Still declares broken `./styles`. Still ships `only-css.js`.

Local post–Phase-2/3 pack dry-run: **87 files**, ~88 KB — includes current deep `.d.ts` graph **and** leftover stale declaration trees if `dist/` was not cleaned.

---

## 4. Verified consumer results (pack smoke)

Performed with `npm pack` of the **current workspace**, then install into fresh `/tmp` projects.

| Check | Result |
|-------|--------|
| ESM `import { convertAdToBs, NepaliDatePicker } from 'nepalipatrojs'` | **PASS** (correct BS date; picker is a function) |
| CJS `require('nepalipatrojs')` | **FAIL** — object with **empty keys**; APIs `undefined` |
| `require.resolve('nepalipatrojs/css')` | **PASS** — file exists (~7.6 KB) |
| `require.resolve` / `import 'nepalipatrojs/styles'` | **FAIL** — `MODULE_NOT_FOUND` (`only-styles.css`) |
| Raw Node `import 'nepalipatrojs/css'` | **FAIL** — `ERR_UNKNOWN_FILE_EXTENSION` (expected without CSS loader; not a bundler bug) |
| `exports` → `./package.json` | **Not exported** — tooling that resolves `nepalipatrojs/package.json` can fail |

**Root cause sketch (CJS):** Package `"type": "module"` makes `dist/*.js` ESM to Node. The UMD file is an IIFE without ESM export bindings, so Node’s `require`/`import` of that entry does not surface `exports.*` as a usable module namespace. Browser script-tag UMD still works via the global branch.

This is a **new/high-severity packaging defect** beyond ISS-008/009/010 and should be tracked in implementation (proposed **ISS-028** below).

---

## 5. CI and publish reliability

### 5.1 `ci.yml`

| Item | Finding | Severity |
|------|---------|----------|
| `continue-on-error: true` on **Build** and **Test** | Failed jobs do not fail the workflow (ISS-010) | **P0** |
| No `tsc --noEmit` / typecheck step | Regressions can ship without a gate | **P1** |
| Cache `path: dist` keyed mainly on `src/**/*.ts` + `tsconfig` | CSS-only / rollup config changes may not bust cache; stale `dist` risk | **P1** |
| Triggers: `main` push/PR only | Feature branches lack default CI signal | **P2** |
| Coverage upload `if: success() \|\| failure()` | Fine; does not fix soft-fail build/test | — |

### 5.2 `npm-publish.yml`

| Item | Finding | Severity |
|------|---------|----------|
| Test job runs `npm test` without prior `build` | Usually OK (Jest uses TS/ts-jest); does not prove pack artifacts | **P2** |
| Publish job: `ci` → `build` → `publish` | No pack install smoke; no assert that `./styles` / types / require work | **P0** |
| Relies on `prepublishOnly` → `build` | Build can succeed while exports remain wrong | **P1** |
| No artifact reuse between test and publish jobs | Two installs; drift risk is low but no “tested tarball” | **P2** |

### 5.3 Local scripts vs docs

- Docs mention `typecheck`; **`package.json` has no `typecheck` script**.
- No `pack:smoke` / consumer-install script.

---

## 6. Risk register (release blockers)

| ID | Issue | Severity | Evidence | Blocks 2.0? |
|----|-------|----------|----------|-------------|
| **P0-CJS / ISS-028 (proposed)** | Node `require` / `exports.require` unusable | **Critical** | Pack install → empty module | **Yes** |
| **P0-ISS-010** | CI soft-fail on build/test | **Critical** | `ci.yml` | **Yes** (honesty) |
| **P0-ISS-009** | Broken `./styles` export | **High** | Missing file; npm 1.0.5 same | **Yes** if export kept |
| **P1-ISS-008** | Types emit/pack/gitignore/bundling story | **High** | Deep relative `.d.ts`; unused dts plugin; published 1.0.5 incomplete vs current tree | **Yes** for TS consumers |
| **P1-STALE-DIST** | Unclean `dist/` packs maps + legacy trees + test fixtures `.d.ts` | **Medium** | Pack lists `__tests__`, old `utils/`, etc. | Soft — quality |
| **P1-CACHE** | CI caches `dist/` | **Medium** | `ci.yml` cache step | Soft — flaky CI |
| **P2-EXPORTS** | `types` condition order; no `./package.json` export; no `sideEffects` | **Low–Med** | Config | Soft |
| **P2-META** | Empty `author`; no `engines`; version still 1.0.5 | **Low** | `package.json` | Soft |
| **P2-CSS-NODE** | Raw Node cannot import CSS | **Low** | Expected | No — document bundler/`<link>` |

Non-packaging (out of Phase 5 impl, still release-adjacent):

| ID | Note |
|----|------|
| ISS-013 | SR speech not validated — a11y claim limiter, not install blocker |
| ISS-016 | Dataset provenance unknown — docs honesty |
| React | Explicitly deferred until vanilla package stable |

---

## 7. Compatibility concerns

| Consumer | Today | 2.0 risk if unfixed |
|----------|-------|---------------------|
| ESM bundlers (Vite/webpack/etc.) | Generally OK | Low if ESM kept |
| CDN / `<script>` UMD | Global `NepaliPatro` + `window.NepaliDatePicker` | Preserve |
| Node / CJS `require('nepalipatrojs')` | **Broken** in smoke | Must fix or officially drop CJS with major + docs |
| `import 'nepalipatrojs/css'` in bundlers | OK | Keep `./css` as canonical |
| `import 'nepalipatrojs/styles'` | Always fails | Remove, alias to `./css`, or emit file |
| TypeScript `moduleResolution` bundler/node16 | Needs complete bundled or complete graph `.d.ts` | High if only partial pack |
| Deep `nepalipatrojs/core` | Not exported (ADR-001) | Keep banned |

**Semver note:** Fixing `./styles`, CJS entry, and tightening exports may be **breaking** for anyone depending on broken paths or accidental deep files — appropriate for **2.0**, with changelog + migration notes.

---

## 8. Required fixes (implementation direction only)

Do **not** apply in this assessment. Intended outcomes:

1. **Usable primary entry for both `import` and `require`** (e.g. real CJS `.cjs` build, or dual-package pattern; do not point `require` at ESM-classified UMD `.js` under `"type":"module"` without proof).
2. **CSS exports honest:** either generate `only-styles.css`, re-point `./styles` → existing CSS, or remove `./styles` with migration note; keep `./css` canonical.
3. **Types:** single public `index.d.ts` (prefer `rollup-plugin-dts` or equivalent) **or** a complete, intentional declaration set; stop shipping accidental internals/stale paths; align `.gitignore` / `files` / clean build.
4. **CI fail-closed:** remove `continue-on-error` from build/test; add typecheck; reconsider `dist` cache; add pack-install smoke on PRs and before publish.
5. **Publish pipeline:** test the **packed** tarball (ESM import, CJS require, CSS resolve, styles policy, `tsc` against types).
6. **Package metadata:** `sideEffects` for CSS; optional `engines`; author; export map cleanup; version plan for 2.0.0.

---

## 9. Proposed implementation stages

Authorize **separately**; each stage should be small and reviewable.

| Stage | Scope | Primary issues | Exit criteria |
|-------|-------|----------------|---------------|
| **5.0** | _(this assessment)_ | — | Report accepted |
| **5.1** | CI honesty | ISS-010 (**done 2026-11-22**: removed soft-fail); typecheck/cache deferred | Build/test failures fail CI; honesty tests + verify script |
| **5.2** | CSS exports | ISS-009 | `./styles` either works or is removed/aliased; docs match; pack smoke asserts policy |
| **5.3** | Module entry / CJS | ISS-028 (proposed) | Pack smoke: ESM + CJS both expose APIs; UMD CDN behavior preserved |
| **5.4** | Types publish | ISS-008, stale dist | Consumer `tsc` resolves public types; no reliance on accidental deep/stale files; clean `dist` before pack |
| **5.5** | Pack smoke + publish gate | Process | CI/publish runs install-from-tarball checks; release checklist updated |
| **5.6** | Release metadata | version, CHANGELOG, migration | Ready for 2.0 tag **after** maintainer release auth |

**Suggested priority order:** 5.1 → 5.3 → 5.2 → 5.4 → 5.5 → 5.6  
(Rationale: stop lying CI first; fix the empty `require` next; then CSS; then types polish; then automate gates; then version bump.)

Alternate if CSS support tickets dominate: swap 5.2 before 5.3 — both remain P0/P1.

**Explicitly out of these stages:** React adapter, ISS-013 SR sessions, dataset replacement, datepicker feature work.

---

## 10. Release-readiness checklist (2.0)

Use after Phase 5 implementation (+ separate decisions on ISS-013 messaging).

### Package

- [x] `npm pack` install: ESM import works
- [x] `npm pack` install: CJS `require` works
- [x] `nepalipatrojs/css` resolves to real CSS
- [x] `nepalipatrojs/styles` policy fixed (alias to `./css`)
- [x] Public TypeScript types resolve in a clean consumer `tsc` project
- [x] No broken / accidental deep exports
- [x] `sideEffects` (or documented equivalent) correct for CSS
- [x] Tarball contents reviewed (no test fixtures, minimal stale junk)

### CI / publish

- [x] Build failure fails CI
- [x] Test failure fails CI
- [x] Typecheck failure fails CI
- [x] Pack smoke in CI
- [x] Publish workflow builds/tests verified artifacts (no soft-fail)
- [ ] Actual npm publish of 2.0.0 (separate auth)

### Product / docs

- [ ] VERSION / CHANGELOG for 2.0
- [ ] Migration notes (exports, CJS, styles, any API breaks already accepted in Phases 1–4)
- [ ] README install examples match reality
- [ ] ISS-016 provenance language retained
- [ ] Accessibility claims match ISS-013 status (no overclaim)

### Deferred (not 2.0 blockers unless claimed)

- [ ] ISS-013 screen-reader validation
- [ ] React integration
- [ ] Physical multi-browser positioning certification beyond current smoke

---

## 11. Proposed new issue

### ISS-028 — Node `require` / `exports.require` yields empty module

- **Severity:** critical (packaging)  
- **Status:** open (found Phase 5 assessment, 2026-11-22)  
- **Evidence:** `npm pack` → install → `require('nepalipatrojs')` → `{}` with undefined APIs; ESM import OK.  
- **Likely cause:** `"type": "module"` + UMD `.js` require entry without ESM/CJS interop that Node accepts.  
- **Related:** `main` / `exports.require`; Rollup UMD output; browser global still separate.

*(Issue filed in `ISSUES.md` as part of assessment documentation only — no fix.)*

---

## 12. Stop / handoff

Phase 5 **assessment complete**. No implementation performed.

**Await maintainer review** and explicit authorization for a specific stage (recommended first: **5.1 CI honesty** or a combined 5.1+5.3 if preferred).

Do not start packaging/CI code changes without a new auth prompt.
