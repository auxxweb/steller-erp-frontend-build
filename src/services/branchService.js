import api from './api.js';

export const fetchBranchStats = () => api.get('/branches/stats');

export const fetchBranches = (params) => api.get('/branches', { params });

export const fetchBranch = (id) => api.get(`/branches/${id}`);

export const fetchBranchDashboard = (id) => api.get(`/branches/${id}/dashboard`);

export const fetchMyBranch = () => api.get('/branches/me');

export const fetchBranchManagers = () => api.get('/branches/managers');

export const createBranch = (payload) => api.post('/branches', payload);

export const updateBranch = (id, payload) => api.patch(`/branches/${id}`, payload);

export const deleteBranch = (id) => api.delete(`/branches/${id}`);
