import pkg from './package.json' assert { type: 'json' };
import esbuild from 'rollup-plugin-esbuild';
import { defineConfig } from 'rollup';

const config = defineConfig([
    {
        input: 'src/index.ts',
        output: [
            {
                file: 'lib/cjs/index.js',
                format: 'cjs',
            },
            {
                file: 'lib/esm/index.mjs',
                format: 'es',
            },
        ],
        external: Object.keys(pkg.dependencies),
        plugins: [
            esbuild({
                target: 'node18',
                tsconfig: 'tsconfig.json',
            }),
        ],
    },
]);

export default config;
