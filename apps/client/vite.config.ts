import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import mkcert from 'vite-plugin-mkcert';

export default defineConfig({
  plugins: [
    react(),
    // Enable mkcert for HTTPS - required for WebRTC on mobile
    // Skip in Docker builds
    ...(process.env.DOCKER_BUILD ? [] : [mkcert()]),
  ],
  server: {
    host: true,
    // Enable HTTPS for WebRTC camera/microphone access (only in dev)
    ...(process.env.DOCKER_BUILD ? {} : { https: {} }),
    port: 5183,
    strictPort: true,
    // Allow both HTTP and HTTPS for network access
    cors: true,
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