# Development setup

## Prerequisites

- Node.js 18+ (CI uses 18 and 20; local may be newer)
- npm

## Install

```bash
npm ci
```

## Common commands

```bash
npm test          # Jest
npm run build     # Rollup → dist/
npm run dev       # Rollup watch
```

## Planned scripts (Phase 5)

- `typecheck` — `tsc --noEmit`
- `lint` — when ESLint is added
- `pack:smoke` — pack + install + import check

## Examples

- `example/example1.html`, `example/example2.html`
- `test-datepicker.html`
- `index.html`

## AI session bootstrap

1. Read `PROJECT_CONTEXT.md`
2. Read `docs/progress/STATUS.md`
3. Read `docs/progress/MASTER-PLAN.md`
4. Read latest file in `docs/progress/logs/`
5. Read relevant ADRs before changing architecture
