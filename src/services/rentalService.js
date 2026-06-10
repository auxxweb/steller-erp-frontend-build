import api from './api.js';

export const fetchRentalStats = (params) => api.get('/rentals/stats', { params });

export const fetchRentals = (params) => api.get('/rentals', { params });

export const fetchRental = (id) => api.get(`/rentals/${id}`);

export const checkRentalAvailability = (payload) =>
  api.post('/rentals/check-availability', payload);

export const createRental = (payload) => api.post('/rentals', payload);

export const updateRental = (id, payload) => api.patch(`/rentals/${id}`, payload);

export const reserveRental = (id, payload = {}) =>
  api.post(`/rentals/${id}/reserve`, payload);

export const pickupRental = (id, payload = {}) => api.post(`/rentals/${id}/pickup`, payload);

export const activateRental = (id) => api.post(`/rentals/${id}/activate`);

export const returnRental = (id, payload = {}) => api.post(`/rentals/${id}/return`, payload);

export const cancelRental = (id, reason) => api.post(`/rentals/${id}/cancel`, { reason });

export const confirmRental = (id) => api.post(`/rentals/${id}/confirm`);

export const maintenanceRental = (id, payload = {}) =>
  api.post(`/rentals/${id}/maintenance`, payload);

export const fetchRentalTimeline = (id) => api.get(`/rentals/${id}/timeline`);

export const closeRental = (id, payload = {}) => api.post(`/rentals/${id}/close`, payload);
