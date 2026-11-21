# Migration: v1 → v2 (draft)

> Status: **outline only**. Fill in concrete diffs as Phase 1–5 land. Do not treat listed items as already shipped.

## Expected areas of change

1. **Locale:** prefer `ne`; `np` still accepted as alias  
2. **Date / timezone:** clarify `Date` input semantics; prefer date-only objects  
3. **Validation:** stricter/correct BS day checks (may start throwing where v1 wrongly accepted)  
4. **Formatting:** fixed token behavior (output for some month names will change — toward correctness)  
5. **CSS / visuals:** new datepicker skin; class names may change  
6. **Package exports:** fix `types` and `./styles`; possible new `./react`  
7. **Removed:** reliance on broken paths / undocumented internals  

## Compatibility goals

- Keep `NepaliPatro.*` method names where practical  
- Keep UMD/CDN story  
- Document every breaking change with before/after examples  

## Checklist before calling 2.0 done

- [ ] This guide completed with real examples  
- [ ] Playground demonstrates v2 APIs  
- [ ] Pack smoke test covers README imports  
