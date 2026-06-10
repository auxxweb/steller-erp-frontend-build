import api from './api.js';

export const fetchPayments = (params) => api.get('/payments', { params });

export const recordPayment = (payload) => api.post('/payments', payload);
