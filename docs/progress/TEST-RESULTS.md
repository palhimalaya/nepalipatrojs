# Test results

Never record a pass unless the command was executed successfully in this environment.

## 2026-11-21 — Phase 0

### Environment

- OS: Linux (Fedora kernel 7.2.x per host info)
- Node: v24.15.0 available
- `node_modules`: **absent** — Jest/build not executed

### Static verification (no test runner)

| Check | Command / method | Result |
|-------|------------------|--------|
| Dist JS/CSS present | `ls dist/` | PASS — `nepali-patro-js.esm.js`, `.umd.js`, `.css` |
| Dist `.d.ts` | glob `dist/**/*.d.ts` | **FAIL** — none |
| `only-styles.css` | `ls dist/` | **FAIL** — missing |
| BS year span | parse `calendar-data.ts` | PASS — 2000–2099 contiguous (100 years) |
| Year total integrity (sample) | Python sum vs stored total | PASS for sampled years incl. 2081 |
| Wrong validation index | emulate tuple access | **CONFIRMED BUG** — month 2 wrong path → 365 |
| Formatter M/d corruption | simulate replace order | **CONFIRMED BUG** — Mangsir/Budhabar |

### Unit tests

```
NOT RUN — npm ci / npm test not executed (no node_modules)
```

### Typecheck

```
NOT RUN
```

### Build

```
NOT RUN this session (preexisting dist artifacts observed only)
```

### Follow-up required at Phase 1 start

```bash
npm ci
npm test
npx tsc --noEmit   # may fail until packaging fixed
npm run build
```

Record outputs here after first run.
