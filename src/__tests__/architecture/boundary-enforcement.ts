/**
 * Stage 2.5 / ISS-018 — architecture boundary enforcement (no extra deps).
 *
 * Scans static `import` / `export … from` / `import()` / `require()` paths and
 * applies layer dependency rules. Used by Jest (positive + negative fixtures).
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { dirname, join, relative, resolve, sep } from 'path';

export type Layer = 'core' | 'i18n' | 'ui' | 'facade' | 'other' | 'ambient';

export interface Violation {
  file: string;
  rule: string;
  detail: string;
}

export interface ImportEdge {
  fromFile: string;
  fromLayer: Layer;
  specifier: string;
  kind: 'static' | 'dynamic' | 'require';
  resolved?: string;
  toLayer?: Layer;
}

const IMPORT_RE =
  /(?:import\s+(?:type\s+)?(?:[\s\S]*?\s+from\s+)?|export\s+(?:type\s+)?[\s\S]*?\s+from\s+|import\s*\(\s*|require\s*\(\s*)['"]([^'"]+)['"]/g;

const DOM_GLOBAL_RE =
  /\b(?:document|window|HTMLElement|HTMLInputElement|NodeList|localStorage|sessionStorage)\b/;

/** Strip // and /* *\/ comments so DOM/import scans ignore prose. */
export function stripComments(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/.*$/gm, '$1');
}

export function classifyPath(absPath: string, srcRoot: string): Layer {
  const rel = relative(srcRoot, absPath).split(sep).join('/');
  if (rel === 'index.ts') return 'facade';
  if (rel.startsWith('core/')) return 'core';
  if (rel.startsWith('i18n/')) return 'i18n';
  if (rel.startsWith('ui/')) return 'ui';
  if (rel.endsWith('.d.ts')) return 'ambient';
  return 'other';
}

export function extractImportSpecifiers(
  source: string
): Array<{ specifier: string; kind: ImportEdge['kind'] }> {
  const code = stripComments(source);
  const out: Array<{ specifier: string; kind: ImportEdge['kind'] }> = [];
  let m: RegExpExecArray | null;
  const re = new RegExp(IMPORT_RE.source, 'g');
  while ((m = re.exec(code)) !== null) {
    const full = m[0];
    const specifier = m[1];
    let kind: ImportEdge['kind'] = 'static';
    if (full.startsWith('import(') || full.includes('import(')) kind = 'dynamic';
    if (full.includes('require(')) kind = 'require';
    out.push({ specifier, kind });
  }
  return out;
}

export function resolveSpecifier(
  fromFile: string,
  specifier: string,
  srcRoot: string
): string | undefined {
  if (!specifier.startsWith('.')) {
    return undefined; // external package — ignore for layer rules
  }
  const base = resolve(dirname(fromFile), specifier);
  const candidates = [
    base,
    `${base}.ts`,
    `${base}.js`,
    join(base, 'index.ts'),
    join(base, 'index.js'),
  ];
  for (const c of candidates) {
    try {
      if (statSync(c).isFile()) {
        // Only track edges inside src/
        if (c.startsWith(srcRoot + sep) || c === srcRoot) {
          return c;
        }
      }
    } catch {
      /* missing candidate */
    }
  }
  // Unresolved relative import still classified by path shape
  return `${base}.ts`;
}

export function walkProductionTs(srcRoot: string): string[] {
  const out: string[] = [];
  function walk(dir: string): void {
    for (const name of readdirSync(dir)) {
      if (name === '__tests__' || name === 'node_modules') continue;
      const p = join(dir, name);
      const st = statSync(p);
      if (st.isDirectory()) walk(p);
      else if (name.endsWith('.ts') && !name.endsWith('.d.ts')) out.push(p);
    }
  }
  walk(srcRoot);
  return out;
}

/** Rules that apply to a single file's source (layer + imports + DOM). */
export function checkFileSource(
  file: string,
  source: string,
  srcRoot: string,
  layer: Layer = classifyPath(file, srcRoot)
): Violation[] {
  const violations: Violation[] = [];
  const code = stripComments(source);
  const rel = relative(srcRoot, file).split(sep).join('/') || file;

  if (layer === 'core' || layer === 'i18n') {
    if (DOM_GLOBAL_RE.test(code)) {
      violations.push({
        file: rel,
        rule: `${layer}-no-dom`,
        detail: 'Uses browser DOM globals (document/window/HTMLElement/…)',
      });
    }
  }

  for (const { specifier, kind } of extractImportSpecifiers(source)) {
    const resolved = resolveSpecifier(file, specifier, srcRoot);
    const toLayer = resolved
      ? classifyPath(resolved, srcRoot)
      : classifySpecifierFallback(specifier);

    const edgeNote = `${kind} import '${specifier}' → ${toLayer}`;

    if (layer === 'core') {
      if (toLayer === 'i18n') {
        violations.push({
          file: rel,
          rule: 'core-no-i18n',
          detail: edgeNote,
        });
      }
      if (toLayer === 'ui') {
        violations.push({
          file: rel,
          rule: 'core-no-ui',
          detail: edgeNote,
        });
      }
      if (toLayer === 'facade') {
        violations.push({
          file: rel,
          rule: 'no-barrel-import',
          detail: edgeNote,
        });
      }
    }

    if (layer === 'i18n') {
      if (toLayer === 'ui') {
        violations.push({
          file: rel,
          rule: 'i18n-no-ui',
          detail: edgeNote,
        });
      }
      if (toLayer === 'facade') {
        violations.push({
          file: rel,
          rule: 'no-barrel-import',
          detail: edgeNote,
        });
      }
    }

    if (layer === 'ui' && toLayer === 'facade') {
      violations.push({
        file: rel,
        rule: 'no-barrel-import',
        detail: edgeNote,
      });
    }
  }

  return violations;
}

function classifySpecifierFallback(specifier: string): Layer {
  const n = specifier.replace(/\\/g, '/');
  if (n.includes('/i18n/') || n.endsWith('/i18n') || n.includes('../i18n')) return 'i18n';
  if (n.includes('/ui/') || n.endsWith('/ui') || n.includes('../ui')) return 'ui';
  if (n.includes('/core/') || n.endsWith('/core') || n.includes('../core')) return 'core';
  if (n === '../index' || n === './index' || n.endsWith('/index')) return 'facade';
  return 'other';
}

export function buildImportGraph(
  srcRoot: string
): { edges: ImportEdge[]; violations: Violation[]; cycles: string[][] } {
  const files = walkProductionTs(srcRoot);
  const edges: ImportEdge[] = [];
  const violations: Violation[] = [];
  const adj = new Map<string, string[]>();

  for (const file of files) {
    const source = readFileSync(file, 'utf8');
    const fromLayer = classifyPath(file, srcRoot);
    violations.push(...checkFileSource(file, source, srcRoot, fromLayer));

    for (const { specifier, kind } of extractImportSpecifiers(source)) {
      const resolved = resolveSpecifier(file, specifier, srcRoot);
      if (!resolved) continue;
      // Only edges to files that exist in the production walk
      if (!files.includes(resolved) && !files.includes(resolved.replace(/\.ts$/, ''))) {
        // still record if resolved path is under src and is a .ts we know
        if (!resolved.startsWith(srcRoot)) continue;
      }
      const toLayer = classifyPath(resolved, srcRoot);
      edges.push({
        fromFile: file,
        fromLayer,
        specifier,
        kind,
        resolved,
        toLayer,
      });
      const fromRel = relative(srcRoot, file);
      const toRel = relative(srcRoot, resolved);
      if (!adj.has(fromRel)) adj.set(fromRel, []);
      adj.get(fromRel)!.push(toRel);
    }
  }

  const cycles = findCycles(adj);
  for (const cycle of cycles) {
    violations.push({
      file: cycle[0],
      rule: 'no-cycles',
      detail: cycle.join(' → '),
    });
  }

  return { edges, violations, cycles };
}

function findCycles(adj: Map<string, string[]>): string[][] {
  const cycles: string[][] = [];
  const visited = new Set<string>();
  const stack = new Set<string>();
  const path: string[] = [];

  function dfs(node: string): void {
    if (stack.has(node)) {
      const i = path.indexOf(node);
      cycles.push([...path.slice(i), node]);
      return;
    }
    if (visited.has(node)) return;
    visited.add(node);
    stack.add(node);
    path.push(node);
    for (const next of adj.get(node) || []) {
      dfs(next);
    }
    path.pop();
    stack.delete(node);
  }

  for (const node of adj.keys()) dfs(node);
  return cycles;
}

/** Facade must not re-export the unpublished calendar dataset. */
export function checkFacadeDatasetPrivacy(
  indexSource: string
): Violation[] {
  const violations: Violation[] = [];
  if (/\bBS_CALENDAR_DATA\b/.test(indexSource)) {
    // Mention in comments is ok; import/export is not
    const code = stripComments(indexSource);
    if (/\bBS_CALENDAR_DATA\b/.test(code)) {
      violations.push({
        file: 'index.ts',
        rule: 'dataset-unpublished',
        detail: 'BS_CALENDAR_DATA appears in public facade (must stay internal)',
      });
    }
  }
  return violations;
}

export function checkPackageExports(packageJson: {
  exports?: Record<string, unknown>;
}): Violation[] {
  const violations: Violation[] = [];
  const exportsMap = packageJson.exports || {};
  for (const key of Object.keys(exportsMap)) {
    if (key === './core' || key.startsWith('./core/')) {
      violations.push({
        file: 'package.json',
        rule: 'no-deep-core-export',
        detail: `Public export map includes '${key}'`,
      });
    }
  }
  return violations;
}

export function scanRepository(srcRoot: string, packageJsonPath: string): Violation[] {
  const { violations } = buildImportGraph(srcRoot);
  const indexPath = join(srcRoot, 'index.ts');
  violations.push(
    ...checkFacadeDatasetPrivacy(readFileSync(indexPath, 'utf8'))
  );
  const pkg = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
  violations.push(...checkPackageExports(pkg));
  return violations;
}
