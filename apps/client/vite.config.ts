import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import mkcert from 'vite-plugin-mkcert';

export default defineConfig({
  plugins: [
    react(),
    // Locally-trusted cert (via mkcert) instead of an ad-hoc self-signed one —
    // an untrusted cert makes the browser show a security interstitial when
    // other apps (e.g. the admin console on logout) redirect here, which
    // breaks that cross-app navigation.
    mkcert(),
  ],
  server: {
    host: true,
    https: {},
    // 5173 is Vite's conventional default, but it's a very common port other
    // local tools/containers grab too — when that happens Vite silently falls
    // back to the next free port instead of erroring, which breaks the admin
    // console's hardcoded VITE_CLIENT_URL redirect target on logout (it ends
    // up pointing at whatever else is squatting on 5173, not this app).
    // strictPort forces a loud "port in use" failure at startup instead.
    port: 5183,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5050',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'http://localhost:5050',
        changeOrigin: true,
        ws: true,
      },
    },
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
});