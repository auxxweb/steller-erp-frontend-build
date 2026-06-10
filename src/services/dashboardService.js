import api from './api.js';

export const fetchWorkspaceDashboard = () => api.get('/dashboard');
