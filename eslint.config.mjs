import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettierConfig from 'eslint-config-prettier';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'warn',
      '@typescript-eslint/no-unsafe-call': 'warn',
      '@typescript-eslint/no-unsafe-assignment': 'warn',
      '@typescript-eslint/no-unsafe-return': 'warn',
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/unbound-method': 'warn',
      '@typescript-eslint/require-await': 'warn',
      '@typescript-eslint/ban-ts-comment': 'warn',
    },
  },
  {
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    files: [
      '**/*.mjs'
    ],
    ...tseslint.configs.disableTypeChecked,
  },
  {
    ignores: ['lib/**', '**/coverage/**']
  },
  prettierConfig,
);
