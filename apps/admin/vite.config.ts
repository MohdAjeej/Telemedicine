import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    // See apps/client/vite.config.ts for why this is a non-default port with
    // strictPort — keeps the client's VITE_ADMIN_CONSOLE_URL redirect target
    // (used on client login for the admin handoff) reliably correct too.
    port: 5184,
    strictPort: true,
    proxy: {
      // 5050, not 5000 — 5000 is a very common default for other local dev
      // servers (Flask, CRA's proxy default, etc.) and collides easily.
      '/api': { target: 'http://localhost:5050', changeOrigin: true },
      '/socket.io': { target: 'http://localhost:5050', changeOrigin: true, ws: true },
    },
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/tests/setup.ts'],
  },
});
