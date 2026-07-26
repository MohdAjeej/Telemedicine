// @ts-check
const js = require('@eslint/js');
const tseslint = require('typescript-eslint');
const prettierConfig = require('eslint-config-prettier');

/** Base ESLint flat config shared by every workspace. */
module.exports = [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  prettierConfig,
  {
    ignores: ['dist/**', 'build/**', 'coverage/**', '.turbo/**', 'node_modules/**'],
  },
  {
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },
];
