import pkg from './package.json' assert { type: 'json' };
import esbuild from 'rollup-plugin-esbuild';
import dts from 'rollup-plugin-dts';
import { defineConfig } from 'rollup';

const external = [...Object.keys(pkg.dependencies), ...Object.keys(pkg.peerDependencies)]
const input = "src/index.ts"

const configs = [
    defineConfig({
        input,
        plugins: [
            esbuild({
                tsconfig: 'tsconfig.json',
            }),
        ],
        output: [
            {
                file: 'lib/esm/index.js',
                format: 'es',
                sourcemap: true,
            },
            {
                file: 'lib/index.cjs',
                format: 'cjs',
                sourcemap: true,
            },
        ],
        external
    }),
    defineConfig({
        input,
        plugins: [dts()],
        output: [
            {
                file: `lib/esm/index.d.ts`,
                format: 'es',
                sourcemap: true,
            },
            {
                file: `lib/index.d.cts`,
                format: 'cjs',
                sourcemap: true,
            },
        ],
        external
    }),
];

export default configs;
