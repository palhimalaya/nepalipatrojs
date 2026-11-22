#!/usr/bin/env node
/**
 * Phase 5.5 — install-from-tarball smoke for public package entry points.
 */
import { mkdtempSync, rmSync, writeFileSync, readFileSync, existsSync } from 'fs';
import { tmpdir } from 'os';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

function run(cmd, opts = {}) {
  const result = spawnSync(cmd, {
    shell: true,
    encoding: 'utf8',
    cwd: opts.cwd ?? root,
    env: { ...process.env, ...opts.env },
  });
  if (result.status !== 0) {
    console.error(result.stdout);
    console.error(result.stderr);
    throw new Error(`Command failed (${result.status}): ${cmd}`);
  }
  return result;
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
  console.log('OK:', msg);
}

// Ensure artifacts exist
assert(existsSync(join(root, 'dist/nepali-patro-js.esm.js')), 'ESM bundle present');
assert(existsSync(join(root, 'dist/nepali-patro-js.cjs')), 'CJS bundle present');
assert(existsSync(join(root, 'dist/nepali-patro-js.umd.js')), 'UMD bundle present');
assert(existsSync(join(root, 'dist/nepali-patro-js.css')), 'CSS present');
assert(existsSync(join(root, 'dist/index.d.ts')), 'index.d.ts present');

const work = mkdtempSync(join(tmpdir(), 'np-pack-smoke-'));
try {
  const pack = run('npm pack --pack-destination ' + JSON.stringify(work));
  const line = (pack.stdout || '')
    .trim()
    .split(/\r?\n/)
    .filter(Boolean)
    .pop();
  const tgz = join(work, line);
  assert(existsSync(tgz), `tarball created (${line})`);

  const consumer = join(work, 'consumer');
  run(`mkdir -p ${JSON.stringify(consumer)}`);
  writeFileSync(
    join(consumer, 'package.json'),
    JSON.stringify({ name: 'np-consumer', private: true, type: 'commonjs' }, null, 2)
  );
  run(`npm install ${JSON.stringify(tgz)}`, { cwd: consumer });

  // CJS require
  const cjsCheck = run(
    `node -e "const m=require('nepalipatrojs'); if(!m.convertAdToBs||!m.NepaliDatePicker||!m.default) process.exit(2); const d=m.convertAdToBs({year:2024,month:1,day:1}); if(d.year!==2080) process.exit(3); console.log('cjs', d.year, d.month, d.day);"`,
    { cwd: consumer }
  );
  assert(/cjs 2080/.test(cjsCheck.stdout || ''), 'CJS require exposes APIs');

  // ESM import (separate package with type:module)
  const esmDir = join(work, 'consumer-esm');
  run(`mkdir -p ${JSON.stringify(esmDir)}`);
  writeFileSync(
    join(esmDir, 'package.json'),
    JSON.stringify({ name: 'np-consumer-esm', private: true, type: 'module' }, null, 2)
  );
  run(`npm install ${JSON.stringify(tgz)}`, { cwd: esmDir });
  const esmCheck = run(
    `node --input-type=module -e "import m, { convertAdToBs, NepaliDatePicker } from 'nepalipatrojs'; const d=convertAdToBs({year:2024,month:1,day:1}); if(d.year!==2080||typeof NepaliDatePicker!=='function'||typeof m.convertAdToBs!=='function') process.exit(2); console.log('esm', d.year);"`,
    { cwd: esmDir }
  );
  assert(/esm 2080/.test(esmCheck.stdout || ''), 'ESM import exposes APIs');

  // CSS + styles resolve
  const css = run(
    `node -e "const fs=require('fs'); const css=require.resolve('nepalipatrojs/css'); const styles=require.resolve('nepalipatrojs/styles'); if(!fs.existsSync(css)||!fs.existsSync(styles)) process.exit(2); if(css!==styles) process.exit(3); if(fs.statSync(css).size<100) process.exit(4); console.log('css-ok', fs.statSync(css).size);"`,
    { cwd: consumer }
  );
  assert(/css-ok/.test(css.stdout || ''), './css and ./styles resolve to the same CSS file');

  // Types: consumer tsc against bundled index.d.ts
  const typesDir = join(work, 'consumer-types');
  run(`mkdir -p ${JSON.stringify(typesDir)}`);
  writeFileSync(
    join(typesDir, 'package.json'),
    JSON.stringify(
      {
        name: 'np-consumer-types',
        private: true,
        type: 'module',
        dependencies: { nepalipatrojs: `file:${tgz}` },
      },
      null,
      2
    )
  );
  run(`npm install`, { cwd: typesDir });
  writeFileSync(
    join(typesDir, 'tsconfig.json'),
    JSON.stringify(
      {
        compilerOptions: {
          module: 'NodeNext',
          moduleResolution: 'NodeNext',
          strict: true,
          noEmit: true,
          skipLibCheck: false,
        },
        include: ['use.ts'],
      },
      null,
      2
    )
  );
  writeFileSync(
    join(typesDir, 'use.ts'),
    `import NepaliPatro, { convertAdToBs, NepaliDatePicker } from 'nepalipatrojs';
const d = convertAdToBs({ year: 2024, month: 1, day: 1 });
const _y: number = d.year;
const _p: typeof NepaliPatro = NepaliPatro;
type Picker = typeof NepaliDatePicker;
const _t: Picker = NepaliDatePicker;
void _y; void _p; void _t;
`
  );
  // Use the library's typescript from root
  run(
    `npx --yes -p typescript@5.8.3 tsc --noEmit -p ${JSON.stringify(join(typesDir, 'tsconfig.json'))}`
  );
  assert(true, 'consumer tsc resolves public types');

  // Tarball should not include deep stale declaration trees
  const listing = run(`tar -tzf ${JSON.stringify(tgz)}`);
  const files = (listing.stdout || '').split(/\r?\n/).filter(Boolean);
  assert(
    !files.some((f) => f.includes('/dist/core/') || f.includes('/dist/utils/')),
    'tarball has no deep dist/core or dist/utils trees'
  );
  assert(
    files.some((f) => f.endsWith('dist/index.d.ts')),
    'tarball includes dist/index.d.ts'
  );
  assert(
    files.some((f) => f.endsWith('dist/nepali-patro-js.cjs')),
    'tarball includes CJS bundle'
  );

  console.log('\nPack smoke passed.');
} finally {
  rmSync(work, { recursive: true, force: true });
}
