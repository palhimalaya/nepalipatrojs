import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import postcss from 'rollup-plugin-postcss';
import dts from 'rollup-plugin-dts';

const production = !process.env.ROLLUP_WATCH;

export default [
  // Main bundle (UMD + ESM)
  {
    input: 'src/index.ts',
    output: [
      {
        file: 'dist/nepali-patro-js.umd.js',
        format: 'umd',
        name: 'NepaliPatroJs',
        sourcemap: true,
        globals: {}
      },
      {
        file: 'dist/nepali-patro-js.esm.js',
        format: 'es',
        sourcemap: true
      }
    ],
    plugins: [
      resolve({
        browser: true,
        preferBuiltins: false
      }),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        sourceMap: true,
        inlineSources: !production,
        module: 'ESNext'
      }),
      postcss({
        extract: 'nepali-patro-js.css',
        minimize: production,
        sourceMap: true
      })
    ]
  },
  
  // CSS-only build
  {
    input: 'src/only-css.js',
    output: {
      file: 'dist/only-css.js',
      format: 'es'
    },
    plugins: [
      postcss({
        extract: 'nepali-patro-js.css',
        minimize: production
      })
    ]
  },
];