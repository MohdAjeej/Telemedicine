import type { UserConfig } from 'vitest/config';

export const baseVitestConfig: UserConfig = {
  test: {
    globals: true,
    reporters: ['default'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      exclude: ['**/dist/**', '**/*.config.*', '**/tests/**'],
    },
  },
};
