import api from './api.js';

export const fetchShifts = (params) => api.get('/shifts', { params });

export const createShift = (payload) => api.post('/shifts', payload);

export const updateShift = (shiftId, payload) => api.patch(`/shifts/${shiftId}`, payload);

export const deleteShift = (shiftId) => api.delete(`/shifts/${shiftId}`);

export const assignUserShifts = (userId, shiftIds) =>
  api.patch(`/shifts/users/${userId}/shifts`, { shiftIds });

