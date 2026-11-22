import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import postcss from 'rollup-plugin-postcss';
import dts from 'rollup-plugin-dts';

const production = !process.env.ROLLUP_WATCH;

const jsPlugins = [
  resolve({
    browser: true,
    preferBuiltins: false,
  }),
  commonjs(),
  typescript({
    tsconfig: './tsconfig.json',
    sourceMap: true,
    inlineSources: !production,
    module: 'ESNext',
    // Phase 5.4: public types come from the dts bundle, not a deep emit graph.
    declaration: false,
    declarationMap: false,
  }),
  postcss({
    extract: 'nepali-patro-js.css',
    minimize: production,
    sourceMap: true,
  }),
];

export default [
  // JS bundles: ESM (import), CJS (require), UMD (CDN / script tag)
  {
    input: 'src/index.ts',
    output: [
      {
        file: 'dist/nepali-patro-js.esm.js',
        format: 'es',
        sourcemap: true,
      },
      {
        file: 'dist/nepali-patro-js.cjs',
        format: 'cjs',
        exports: 'named',
        sourcemap: true,
      },
      {
        file: 'dist/nepali-patro-js.umd.js',
        format: 'umd',
        name: 'NepaliPatro',
        exports: 'named',
        sourcemap: true,
        globals: {
          NepaliDatepicker: 'NepaliDatepicker',
        },
      },
    ],
    plugins: jsPlugins,
  },

  // CSS extract only (not published; see package.json files allowlist)
  {
    input: 'src/only-css.js',
    output: {
      file: 'dist/only-css.js',
      format: 'es',
    },
    plugins: [
      postcss({
        extract: 'nepali-patro-js.css',
        minimize: production,
      }),
    ],
  },

  // Phase 5.4: single public declaration file
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.d.ts',
      format: 'es',
    },
    plugins: [dts()],
  },
];
