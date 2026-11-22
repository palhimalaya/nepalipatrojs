# Packaging and CI

> Phase 5 assessment: [phase5-packaging-assessment.md](phase5-packaging-assessment.md)  
> Stages **5.1–5.6 implemented** 2026-11-22 (npm publish not authorized).

## Current package.json (post Phase 5)

| Field | Value | Status |
|-------|-------|--------|
| `version` | `2.0.0` | Repo prepared; npm still on `1.0.5` until publish auth |
| `main` | `./dist/nepali-patro-js.cjs` | CJS require works (ISS-028) |
| `module` | `./dist/nepali-patro-js.esm.js` | ESM import works |
| `types` | `./dist/index.d.ts` | Bundled via `rollup-plugin-dts` (ISS-008) |
| `exports["."]` | types → import → require | Order: types first |
| `exports["./css"]` | `./dist/nepali-patro-js.css` | Canonical CSS |
| `exports["./styles"]` | same CSS file | Alias (ISS-009) |
| `files` | Explicit allowlist | No deep stale `.d.ts` trees |
| `sideEffects` | CSS paths | Bundler CSS retention |
| `engines` | `node >= 18` | Documented |

UMD `dist/nepali-patro-js.umd.js` remains for CDN / `<script>` (global `NepaliPatro`).

## Build

```bash
npm run clean && rollup -c   # via npm run build
```

Outputs: ESM, CJS, UMD, CSS, bundled `index.d.ts`.

## CI / publish

- `ci.yml`: typecheck → build → test → pack:smoke (no `continue-on-error`)
- `npm-publish.yml`: same gates before `npm publish`
- Local: `npm run pack:smoke`
