/** Shared PWA manifest + Workbox config for vite.config.js */

const withBase = (base, path) => {
  const normalizedBase = base.endsWith('/') ? base : `${base}/`;
  const normalizedPath = path.startsWith('/') ? path.slice(1) : path;
  return `${normalizedBase}${normalizedPath}`;
};

const ICON_PATHS = [
  { path: 'icons/icon-72x72.png', sizes: '72x72' },
  { path: 'icons/icon-96x96.png', sizes: '96x96' },
  { path: 'icons/icon-128x128.png', sizes: '128x128' },
  { path: 'icons/icon-144x144.png', sizes: '144x144' },
  { path: 'icons/icon-152x152.png', sizes: '152x152' },
  { path: 'icons/icon-192x192.png', sizes: '192x192', purpose: 'any' },
  { path: 'icons/icon-384x384.png', sizes: '384x384' },
  { path: 'icons/icon-512x512.png', sizes: '512x512', purpose: 'any' },
  {
    path: 'icons/maskable-icon-512x512.png',
    sizes: '512x512',
    purpose: 'maskable',
  },
];

export function createPwaManifest(base = '/') {
  const icons = ICON_PATHS.map(({ path, sizes, purpose }) => ({
    src: withBase(base, path),
    sizes,
    type: 'image/png',
    ...(purpose ? { purpose } : {}),
  }));

  const screenshot = {
    src: withBase(base, 'icons/icon-512x512.png'),
    sizes: '512x512',
    type: 'image/png',
  };

  return {
    id: 'steller-rental-software',
    name: 'Steller Rental Software',
    short_name: 'Steller',
    description:
      'Steller Rental Software — manage camera rentals, bookings, billing, and inventory.',
    theme_color: '#0a0a0a',
    background_color: '#0a0a0a',
    display: 'standalone',
    display_override: ['window-controls-overlay', 'standalone', 'browser'],
    orientation: 'portrait',
    scope: base,
    start_url: base,
    lang: 'en',
    dir: 'ltr',
    categories: ['business', 'productivity'],
    prefer_related_applications: false,
    icons,
    screenshots: [
      { ...screenshot, form_factor: 'narrow', label: 'Steller Rental Software mobile' },
      { ...screenshot, form_factor: 'wide', label: 'Steller Rental Software desktop' },
    ],
  };
}

/** @deprecated Use createPwaManifest — kept for imports that expect a static object */
export const pwaManifest = createPwaManifest('/');

export function createPwaWorkbox(base = '/') {
  const normalizedBase = base.endsWith('/') ? base : `${base}/`;

  return {
    globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,woff2,json,webmanifest}'],
    globIgnores: ['**/icons.svg'],
    navigateFallback: `${normalizedBase}index.html`,
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
        urlPattern: ({ url, sameOrigin }) => sameOrigin && url.pathname.includes('/api'),
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
}

/** @deprecated Use createPwaWorkbox */
export const pwaWorkbox = createPwaWorkbox('/');
