import api from './api.js';

export const fetchWorkspaceSettings = () => api.get('/settings');

export const updateBranchSettings = (payload) => api.patch('/settings/branch', payload);
