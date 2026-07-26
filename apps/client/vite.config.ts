import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico'],
      manifest: {
        name: 'Telemedicine Platform',
        short_name: 'Telemedicine',
        description: 'Enterprise Telemedicine Management System',
        theme_color: '#2f6fed',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
      workbox: {
        navigateFallbackDenylist: [/^\/api/, /^\/socket\.io/],
      },
    }),
  ],
  server: {
    port: 5173,
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
