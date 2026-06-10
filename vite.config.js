import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import { pwaManifest, pwaWorkbox } from './pwa.manifest.js';

const rootDir = dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, rootDir, '');
  const runtimeCaching = [...pwaWorkbox.runtimeCaching];

  if (env.VITE_API_URL) {
    try {
      const apiOrigin = new URL(env.VITE_API_URL).origin;
      const escaped = apiOrigin.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      runtimeCaching.push({
        urlPattern: new RegExp(`^${escaped}/`, 'i'),
        handler: 'NetworkFirst',
        options: {
          cacheName: 'stellar-remote-api-cache',
          networkTimeoutSeconds: 10,
          expiration: {
            maxEntries: 80,
            maxAgeSeconds: 60 * 5,
          },
          cacheableResponse: { statuses: [0, 200] },
        },
      });
    } catch {
      // Invalid VITE_API_URL — skip remote API caching rule
    }
  }

  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'prompt',
        injectRegister: false,
        includeAssets: [
          'favicon.svg',
          'icons/**/*.png',
          'splash/**/*.png',
          'offline.html',
        ],
        manifest: pwaManifest,
        workbox: {
          ...pwaWorkbox,
          runtimeCaching,
        },
        devOptions: {
          enabled: false,
          type: 'module',
          navigateFallback: 'index.html',
        },
      }),
    ],
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: 'http://localhost:5000',
          changeOrigin: true,
        },
      },
    },
  };
});
