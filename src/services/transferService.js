import api from './api.js';

export const fetchTransferStats = (params) => api.get('/transfers/stats', { params });

export const fetchTransfers = (params) => api.get('/transfers', { params });

export const fetchTransfer = (id) => api.get(`/transfers/${id}`);

export const createTransfer = (payload) => api.post('/transfers', payload);

export const updateTransfer = (id, payload) => api.patch(`/transfers/${id}`, payload);

export const approveTransfer = (id) => api.post(`/transfers/${id}/approve`);

export const cancelTransfer = (id, payload) => api.post(`/transfers/${id}/cancel`, payload);

export const dispatchTransferScan = (id, payload) =>
  api.post(`/transfers/${id}/dispatch-scan`, payload);

export const deliveryTransferScan = (id, payload) =>
  api.post(`/transfers/${id}/delivery-scan`, payload);
