import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./src/tests/setup.ts'],
    testTimeout: 20000,
    hookTimeout: 600000,
    env: {
      NODE_ENV: 'test',
      // tests/setup.ts connects mongoose to an in-memory Mongo instance
      // directly; this only needs to satisfy env.ts's fail-fast schema.
      MONGO_URI: 'mongodb://127.0.0.1:27017/telemedicine-test',
      JWT_ACCESS_SECRET: 'test-access-secret-key-not-for-production',
      JWT_REFRESH_SECRET: 'test-refresh-secret-key-not-for-production',
    },
  },
});
