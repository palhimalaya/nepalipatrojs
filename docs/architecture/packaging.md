# Packaging and CI

## Current package.json (verified)

| Field | Value | Problem |
|-------|-------|---------|
| `main` | `dist/nepali-patro-js.umd.js` | OK for CJS/UMD consumers |
| `module` | `dist/nepali-patro-js.esm.js` | OK |
| `types` | `dist/index.d.ts` | **File does not exist in dist/** |
| `exports["."].types` | `./dist/index.d.ts` | Same |
| `exports["./css"]` | `./dist/nepali-patro-js.css` | File exists (~3KB) |
| `exports["./styles"]` | `./dist/only-styles.css` | **File does not exist** |
| `files` | `["dist"]` | Only committed JS/CSS (see gitignore) |

## Build (Rollup)

- Inputs: `src/index.ts` → UMD + ESM; `src/only-css.js` → CSS extract
- `rollup-plugin-dts` is **imported but unused** — no declaration emit pipeline
- `.gitignore` keeps only `.umd.js`, `.esm.js`, `.css` under `dist/` — even if `.d.ts` were built, they would be ignored unless gitignore is updated

## CI

`ci.yml`:

- Matrix Node 18.x, 20.x
- `npm run build` and `npm test` both use **`continue-on-error: true`** → red builds can still look green
- No dedicated `tsc --noEmit` / lint job

`npm-publish.yml`:

- On release: test job, then separate publish job rebuilds and publishes
- Publish job does not re-run tests after build in the same job; relies on `needs: build`
- No packed-artifact smoke install

## Proposed v2 packaging goals

1. Generate and publish real `.d.ts` (and fix gitignore / `files`).
2. Align CSS export names with actual artifacts (or generate `only-styles.css`).
3. Export map for `.`, `./css`, optionally `./react`.
4. `sideEffects` for CSS correctness in bundlers.
5. CI: fail on typecheck, test, build; coverage threshold once baseline known.
6. `npm pack` + install smoke test in CI before publish.
7. Document UMD global name (`NepaliPatro`) and `NepaliDatePicker` attachment.
