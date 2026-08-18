import api from './api.js';

export const verifyQr = (scannedValue, window = {}) =>
  api.post('/qr/verify', {
    scannedValue,
    startAt: window.startAt,
    endAt: window.endAt,
    excludeRentalId: window.excludeRentalId,
  });

export const executeQrScan = (scannedValue, action, options = {}) =>
  api.post('/qr/scan', { scannedValue, action, ...options });

export const lookupQr = (params) => api.get('/qr/lookup', { params });

export const ensureUnitQr = (unitId) => api.post(`/qr/units/${unitId}/generate`);
