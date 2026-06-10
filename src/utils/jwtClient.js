/**
 * Client-side JWT helpers (decode only — never trust for authorization).
 */

export const decodeJwtPayload = (token) => {
  if (!token || typeof token !== 'string') return null;

  try {
    const base64 = token.split('.')[1];
    const json = atob(base64.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json);
  } catch {
    return null;
  }
};

export const getTokenExpiryMs = (token) => {
  const payload = decodeJwtPayload(token);
  if (!payload?.exp) return null;
  return payload.exp * 1000;
};

export const isTokenExpired = (token, skewMs = 0) => {
  const exp = getTokenExpiryMs(token);
  if (!exp) return true;
  return Date.now() >= exp - skewMs;
};

export const msUntilExpiry = (token, skewMs = 30_000) => {
  const exp = getTokenExpiryMs(token);
  if (!exp) return 0;
  return Math.max(0, exp - Date.now() - skewMs);
};
