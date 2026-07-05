/**
 * Centralized Vite environment access for API URLs and deployment base path.
 *
 * Supported variables (first match wins for API):
 *   VITE_API_BASE_URL — full API root, e.g. https://api.example.com/api/v1
 *   VITE_API_URL      — legacy alias for VITE_API_BASE_URL
 *   VITE_BACKEND_URL  — server origin only; /api/v1 is appended
 *
 * Dev fallback: /api/v1 (Vite dev proxy). Production requires an explicit URL.
 */

const trimSlash = (value) =>
  typeof value === 'string' ? value.trim().replace(/\/+$/, '') : '';

const readEnv = (key) => trimSlash(import.meta.env[key]);

export function resolveApiBaseUrl() {
  const apiBase = readEnv('VITE_API_BASE_URL') || readEnv('VITE_API_URL');
  if (apiBase) return apiBase;

  const backend = readEnv('VITE_BACKEND_URL');
  if (backend) return `${backend}/api/v1`;

  if (import.meta.env.DEV) return '/api/v1';

  throw new Error(
    'Missing API configuration. Set VITE_API_BASE_URL or VITE_BACKEND_URL before building for production.',
  );
}

export function getAppName() {
  return import.meta.env.VITE_APP_NAME || 'Steller Rental Software';
}

/**
 * React Router basename (no trailing slash).
 * Custom domain serves the app at /; github.io project URLs use a subpath.
 */
export function getRouterBasename() {
  if (typeof window !== 'undefined') {
    const { hostname, pathname } = window.location;
    const isCustomDomain =
      hostname === 'stelleronline.com' || hostname === 'www.stelleronline.com';
    if (isCustomDomain) return undefined;

    const githubProjectPrefix = '/steller-erp-frontend-build';
    if (hostname.endsWith('.github.io') && pathname.startsWith(githubProjectPrefix)) {
      return githubProjectPrefix;
    }
  }

  const base = import.meta.env.BASE_URL || '/';
  const trimmed = base.replace(/\/$/, '');
  return trimmed || undefined;
}

/** GitHub Pages / subdirectory asset prefix with trailing slash. */
export function getAssetBase() {
  const base = import.meta.env.BASE_URL || '/';
  return base.endsWith('/') ? base : `${base}/`;
}

/**
 * Fail fast in production when API env vars are missing.
 * Call once at app startup.
 */
export function assertProductionEnv() {
  if (!import.meta.env.PROD) return;
  resolveApiBaseUrl();
}
