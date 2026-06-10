import api from './api.js';

export const fetchComboStats = (params) => api.get('/combos/stats', { params });

export const fetchCombos = (params) => api.get('/combos', { params });

export const fetchCombo = (id) => api.get(`/combos/${id}`);

export const previewCombo = (payload) => api.post('/combos/preview', payload);

export const fetchComboPrice = (id, params) => api.get(`/combos/${id}/price`, { params });

export const fetchComboAvailability = (id, params) =>
  api.get(`/combos/${id}/availability`, { params });

export const createCombo = (payload) => api.post('/combos', payload);

export const updateCombo = (id, payload) => api.patch(`/combos/${id}`, payload);

export const deleteCombo = (id) => api.delete(`/combos/${id}`);
