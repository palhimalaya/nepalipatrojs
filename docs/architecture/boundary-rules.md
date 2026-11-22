# Architecture boundary rules (Stage 2.5 / ISS-018)

Enforced by Jest via `src/__tests__/architecture/boundary-enforcement.ts` and
`boundaries.test.ts`. No extra npm dependency.

## Rules

| ID | Rule |
|----|------|
| `core-no-i18n` | `core/` must not import `i18n/` (static, `import()`, or `require`) |
| `core-no-ui` | `core/` must not import `ui/` |
| `core-no-dom` | `core/` must not use browser DOM globals |
| `i18n-no-ui` | `i18n/` must not import `ui/` |
| `i18n-no-dom` | `i18n/` must not use browser DOM globals |
| `no-barrel-import` | Internal modules must not import `src/index.ts` |
| `no-cycles` | Production import graph must be acyclic |
| `dataset-unpublished` | `BS_CALENDAR_DATA` must not appear in the public facade |
| `no-deep-core-export` | `package.json` exports must not expose `./core` |

Allowed:

- `ui/` → `core/`, `i18n/`
- `i18n/` → `core/`
- `index.ts` → compose and re-export public API

## Commands

```bash
npx jest src/__tests__/architecture/boundaries.test.ts --runInBand --coverage=false
npx jest --runInBand --coverage=false   # full suite includes architecture tests
```

## Negative coverage

`boundaries.test.ts` feeds synthetic sources that violate each major rule and
asserts the checker reports them. Passing the live tree alone is not sufficient.

## Documented ownership exceptions (not moved in Stage 2.5)

See evaluation in Stage 2.5 handoff / ISSUES.md. Corrections require separate approval.
