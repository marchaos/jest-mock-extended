import { defineConfig, configDefaults } from 'vitest/config';

export default defineConfig({
    ...configDefaults,
    test: {
        globals: true,
        coverage: {
            ...configDefaults.coverage,
            exclude: [...configDefaults.coverage.exclude, '**/*.spec.ts'],
        },
    },
});
