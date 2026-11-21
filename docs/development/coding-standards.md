# Coding standards (v2)

- Strict TypeScript; avoid `any`.
- Core modules: no `window`, `document`, or React imports.
- No circular dependencies; UI must not import the public barrel for core symbols.
- Prefer small pure functions for calendar math.
- Public errors: clear messages; later consider error codes.
- Do not change `BS_CALENDAR_DATA` or reference epoch without ADR update + proof.
- Tests required for bug fixes (regression first when possible).
- Update progress docs in the same session as meaningful changes.
