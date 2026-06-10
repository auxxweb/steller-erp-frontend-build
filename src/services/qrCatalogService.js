import api from './api.js';

export const fetchQrCatalogUnits = (params) => api.get('/qr-catalog/units', { params });

export const fetchQrCatalogUnit = (unitId) => api.get(`/qr-catalog/units/${unitId}`);

export const downloadQrCatalogUnitPng = (unitId) =>
  api.get(`/qr-catalog/units/${unitId}/download.png`, { responseType: 'blob' });

export const downloadQrCatalogBulkZip = (params) =>
  api.get('/qr-catalog/units/bulk.zip', {
    params,
    responseType: 'blob',
    timeout: 120000,
  });

export const triggerBlobDownload = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};
