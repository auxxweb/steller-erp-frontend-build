import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import { createPwaManifest, createPwaWorkbox } from './pwa.manifest.js';

const rootDir = dirname(fileURLToPath(import.meta.url));

/** Custom domain (stelleronline.com) is served at /. Use subpath only for github.io testing. */
const DEFAULT_PAGES_BASE = '/';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, rootDir, '');
  const base =
    env.VITE_BASE_PATH || (mode === 'production' ? DEFAULT_PAGES_BASE : '/');
  const isSubdirectoryDeploy = base !== '/';
  const enablePwa = env.VITE_ENABLE_PWA !== 'false' && !isSubdirectoryDeploy;
  const runtimeCaching = [...createPwaWorkbox(base).runtimeCaching];

  const apiUrl =
    env.VITE_API_BASE_URL?.trim() ||
    env.VITE_API_URL?.trim() ||
    (env.VITE_BACKEND_URL?.trim() ? `${env.VITE_BACKEND_URL.trim().replace(/\/$/, '')}/api/v1` : '');

  if (apiUrl) {
    try {
      const apiOrigin = new URL(apiUrl).origin;
      const escaped = apiOrigin.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      runtimeCaching.push({
        urlPattern: new RegExp(`^${escaped}/`, 'i'),
        handler: 'NetworkFirst',
        options: {
          cacheName: 'stellar-remote-api-cache',
          networkTimeoutSeconds: 30,
          expiration: {
            maxEntries: 80,
            maxAgeSeconds: 60 * 5,
          },
          cacheableResponse: { statuses: [0, 200] },
        },
      });
    } catch {
      // Invalid API URL — skip remote API caching rule
    }
  }

  const devProxyTarget =
    env.VITE_DEV_PROXY_TARGET?.trim() ||
    env.VITE_BACKEND_URL?.trim() ||
    'http://localhost:5000';

  return {
    base,
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        disable: !enablePwa,
        registerType: 'prompt',
        injectRegister: false,
        includeAssets: [
          'favicon.png',
          'icons/**/*.png',
          'splash/**/*.png',
          'offline.html',
        ],
        manifest: createPwaManifest(base),
        workbox: {
          ...createPwaWorkbox(base),
          runtimeCaching,
        },
        devOptions: {
          enabled: false,
          type: 'module',
          navigateFallback: 'index.html',
        },
      }),
    ],
    build: {
      sourcemap: false,
      target: 'es2020',
    },
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: devProxyTarget,
          changeOrigin: true,
          timeout: 120_000,
          proxyTimeout: 120_000,
        },
      },
    },
  };
});
