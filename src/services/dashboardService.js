import api from './api.js';

export const fetchWorkspaceDashboard = (params) => api.get('/dashboard', { params });
