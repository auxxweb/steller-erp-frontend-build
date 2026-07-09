import api from './api.js';

export const fetchWorkspaceSettings = () => api.get('/settings');

export const updateBranchSettings = (payload) => api.patch('/settings/branch', payload);

export const updateOrganizationSettings = (payload) => api.patch('/settings/organization', payload);
