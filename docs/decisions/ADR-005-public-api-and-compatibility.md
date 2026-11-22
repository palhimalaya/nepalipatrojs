# ADR-005: Public API and compatibility

- **Date:** 2026-11-21
- **Status:** Accepted
- **Phase:** 0
- **Accepted:** 2026-11-21 (after amendment: v1 inventory freeze, deprecation policy, pack tests)

## Context

v1 exposes a `NepaliPatro` static class, named function exports, and `NepaliDatePicker`. Locale docs disagree (`ne` vs `np`). Types field points at missing declarations. Consumers may rely on UMD globals.

## Decision history

1. **Proposed (2026-11-21):** Keep facade; date-only preferred APIs; `ne` canonical / `np` alias; real `.d.ts`; migration guide.
2. **Amended & accepted (2026-11-21):** Freeze and document complete v1 public API before removals; deprecation/removal policy; preserve UMD global; test packed package imports; document Date/CSS/export semantic changes.

## Decision (accepted)

### Surface

1. Preserve the **`NepaliPatro` static facade** and useful named exports.
2. Prefer new **date-only** APIs for conversion/arithmetic (per ADR-002).
3. Preserve the **UMD browser global** where practical (`NepaliPatro` / `NepaliDatePicker` as today).
4. Generate and **test** real TypeScript declaration files; align `package.json` `types` / `exports`.

### Locales

- Canonical: **`en`** and **`ne`**
- Legacy alias: **`np` → `ne`** (compatibility; document deprecation)

### Compatibility process

1. **Document the complete v1 public API** (inventory) **before removing** any export. See ISS-017.
2. Define **deprecation and removal policy**:
   - Prefer deprecate-in-docs (and optional dev warning) in 2.x for aliases like `np`.
   - Removals only with migration-guide entries and major-version justification.
3. Explicitly document in `docs/migration/v1-to-v2.md`:
   - Legacy `Date` local-field semantics vs date-only APIs (ADR-002)
   - Locale `ne` / `np`
   - CSS / visual / class-name changes
   - Export path fixes (`types`, `./css`, `./styles`, future `./react`)
4. **Test actual package installation** (`npm pack` + install) and public imports in CI before calling packaging done.

## Alternatives considered

| Alternative | Notes |
|-------------|-------|
| Hard-break rename everything | Unnecessary churn |
| Keep `np` forever as sole id | Conflicts with BCP 47 / docs already saying `ne` |
| Drop UMD | Rejected for CDN consumers |

## Consequences

- Migration guide is a release gate for 2.0.
- Smoke tests assert README-level imports.
- No silent deletion of v1 exports during early phases.
