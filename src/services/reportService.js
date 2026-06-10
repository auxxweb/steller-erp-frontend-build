import api from './api.js';

export const fetchRentalJobReport = (params) => api.get('/reports/rental-jobs', { params });

export const fetchSalesReport = (params) => api.get('/reports/sales', { params });

export const exportRentalJobReport = (params) =>
  api.get('/reports/rental-jobs/export', { params });

export const exportSalesReport = (params) => api.get('/reports/sales/export', { params });
