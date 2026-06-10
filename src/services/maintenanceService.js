import api from './api.js';

export const fetchMaintenance = (params) => api.get('/maintenance', { params });

export const fetchMaintenanceById = (id) => api.get(`/maintenance/${id}`);

export const createMaintenance = (payload) => api.post('/maintenance', payload);

export const startMaintenance = (id, payload) => api.post(`/maintenance/${id}/start`, payload);

export const completeMaintenance = (id, payload) =>
  api.post(`/maintenance/${id}/complete`, payload);

export const cancelMaintenance = (id, reason) =>
  api.post(`/maintenance/${id}/cancel`, { reason });
