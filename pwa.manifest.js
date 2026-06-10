/** Shared PWA manifest + Workbox config for vite.config.js */
export const pwaManifest = {
  id: 'stellar-camera-rentals-erp',
  name: 'Stellar Camera Rentals ERP',
  short_name: 'Stellar ERP',
  description:
    'Manage camera rentals, inventory, branches, and deliveries — online or offline.',
  theme_color: '#0a0a0a',
  background_color: '#0a0a0a',
  display: 'standalone',
  display_override: ['window-controls-overlay', 'standalone', 'browser'],
  orientation: 'any',
  scope: '/',
  start_url: '/',
  lang: 'en',
  dir: 'ltr',
  categories: ['business', 'productivity'],
  prefer_related_applications: false,
  icons: [
    { src: '/icons/icon-72x72.png', sizes: '72x72', type: 'image/png' },
    { src: '/icons/icon-96x96.png', sizes: '96x96', type: 'image/png' },
    { src: '/icons/icon-128x128.png', sizes: '128x128', type: 'image/png' },
    { src: '/icons/icon-144x144.png', sizes: '144x144', type: 'image/png' },
    { src: '/icons/icon-152x152.png', sizes: '152x152', type: 'image/png' },
    { src: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
    { src: '/icons/icon-384x384.png', sizes: '384x384', type: 'image/png' },
    { src: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
    {
      src: '/icons/maskable-icon-512x512.png',
      sizes: '512x512',
      type: 'image/png',
      purpose: 'maskable',
    },
  ],
  screenshots: [
    {
      src: '/icons/icon-512x512.png',
      sizes: '512x512',
      type: 'image/png',
      form_factor: 'narrow',
      label: 'Stellar ERP mobile',
    },
    {
      src: '/icons/icon-512x512.png',
      sizes: '512x512',
      type: 'image/png',
      form_factor: 'wide',
      label: 'Stellar ERP desktop',
    },
  ],
};

export const pwaWorkbox = {
  globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,woff2,json,webmanifest}'],
  globIgnores: ['**/icons.svg'],
  navigateFallback: '/index.html',
  navigateFallbackDenylist: [/^\/api\//],
  cleanupOutdatedCaches: true,
  clientsClaim: true,
  skipWaiting: false,
  offlineGoogleAnalytics: false,
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts-stylesheets',
        expiration: {
          maxEntries: 10,
          maxAgeSeconds: 60 * 60 * 24 * 365,
        },
        cacheableResponse: { statuses: [0, 200] },
      },
    },
    {
      urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts-webfonts',
        expiration: {
          maxEntries: 30,
          maxAgeSeconds: 60 * 60 * 24 * 365,
        },
        cacheableResponse: { statuses: [0, 200] },
      },
    },
    {
      urlPattern: ({ url, sameOrigin }) => sameOrigin && url.pathname.startsWith('/api'),
      handler: 'NetworkFirst',
      options: {
        cacheName: 'stellar-api-cache',
        networkTimeoutSeconds: 10,
        expiration: {
          maxEntries: 80,
          maxAgeSeconds: 60 * 5,
        },
        cacheableResponse: { statuses: [0, 200] },
      },
    },
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|avif)$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'stellar-images-cache',
        expiration: {
          maxEntries: 64,
          maxAgeSeconds: 60 * 60 * 24 * 30,
        },
      },
    },
    {
      urlPattern: /\.(?:js|css)$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'stellar-static-resources',
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 60 * 60 * 24 * 7,
        },
      },
    },
  ],
};
