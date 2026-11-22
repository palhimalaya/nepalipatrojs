# Migration: v1 → v2

## Package / install

| Topic | v1 (`1.0.x`) | v2 (`2.0.0`) |
|-------|--------------|--------------|
| ESM | `import … from 'nepalipatrojs'` | Unchanged (preferred) |
| CommonJS | `require('nepalipatrojs')` often empty under `"type":"module"` + UMD | **Fixed** — `require` resolves to `dist/nepali-patro-js.cjs` |
| CSS | `nepalipatrojs/css` | Unchanged (canonical) |
| `nepalipatrojs/styles` | Broken (`only-styles.css` missing) | **Alias** of `./css` → same CSS file |
| Types | Fragile / incomplete on npm | Bundled `dist/index.d.ts` |
| Node | Unspecified | `engines.node >= 18` |
| Bundles | ESM + UMD | ESM + **CJS** + UMD (CDN) |

```js
// CJS
const np = require('nepalipatrojs');
np.convertAdToBs({ year: 2024, month: 1, day: 1 });
const NepaliPatro = np.default;
```

```ts
// ESM
import NepaliPatro, { convertAdToBs, NepaliDatePicker } from 'nepalipatrojs';
import 'nepalipatrojs/css';
```

## Behavioral / API notes (already landed before packaging)

1. Prefer date-only `{ year, month, day }` APIs (`convertAdToBs` / `convertBsToAd`).
2. Locale: runtime still uses `'np'`; docs mention future `'ne'` alias (ISS-005).
3. Datepicker: modular UI, keyboard/ARIA, constraints, dual AD labels, theme tokens.
4. Dataset provenance remains **unknown** (ISS-016) — round-trips ≠ historical proof.

## Checklist before publishing 2.0

- [x] Pack smoke: ESM, CJS, CSS/styles, types
- [x] CI fails on typecheck / build / test / pack smoke
- [ ] Maintainer release authorization + npm publish
- [ ] ISS-013 SR validation (optional for install; required before strong a11y claims)
