# Release process

## Current (v1)

- `prepublishOnly` → `npm run build`
- GitHub release triggers `.github/workflows/npm-publish.yml` (test job → publish job with `NPM_TOKEN`)

## Target (v2)

1. All Phase acceptance criteria for the release milestone met  
2. CI green without `continue-on-error` on build/test/typecheck  
3. Pack smoke test green  
4. `docs/migration/v1-to-v2.md` updated for any breaking changes  
5. CHANGELOG entry for the version  
6. Tag release → publish workflow  

Do not publish from an unverified local machine as the only gate.
