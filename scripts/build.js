import { parse } from 'path';

import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';
import { rollup } from 'rollup';

import getBanner from './banner.js';

console.log('Build:');
compile('src/index.ts');
compile('src/teleport.ts');
compile('src/vue-router.ts');
compile('src/vuetify.ts');
compile('src/vuex.ts');
compile('src/h-demi.ts');
console.log('done.');

/**
 * Compile
 *
 * @param {string} file - target
 */
async function compile(file) {
  console.log(`compile: ${file}`);
  /** @param {string} */
  const name = parse(file).name;
  /** @param {import('rollup').RollupBuild} */
  const bundle = await rollup({
    external: ['vue', 'vuex', 'vue-router', 'vue-demi', 'vuetify/lib'],
    input: file,
    plugins: [typescript()],
  });
  /** @param {string} */
  const banner = getBanner(name === 'h-demi');
  /** @param {Record<string, string>} */
  const globals = {
    'h-demi': 'hDemi',
    'vue-demi': 'VueDemi',
    'vue-router': 'VueRouter',
    'vuetify/lib': 'Vuetify',
    vue: 'Vue',
    vuex: 'Vuex',
  };
  /** @param {import('rollup').RollupOutput} */
  await bundle.write({
    banner,
    file: `dist/${name}.es.js`,
    format: 'esm',
    globals: globals,
    sourcemap: true,
  });
  /** @param {import('rollup').RollupOutput} */
  await bundle.write({
    banner,
    exports: 'named',
    file: `dist/${name}.umd.js`,
    format: 'umd',
    globals: globals,
    name: name,
    plugins: [terser()],
    sourcemap: true,
  });
  /** @param {import('rollup').RollupOutput} */
  await bundle.write({
    banner,
    exports: 'named',
    extend: true,
    file: `dist/${name}.iife.js`,
    format: 'iife',
    globals: globals,
    name: name,
    plugins: [terser()],
    sourcemap: true,
  });
}
