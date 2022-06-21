import { defineConfig, configDefaults } from 'vitest/config';

export default defineConfig({
  test: {
    ...configDefaults,
    coverage: {
      ...configDefaults.coverage,
      exclude: [...configDefaults.coverage.exclude, '**/*.spec.ts'],
    },
  },
});
