import api from './api.js';

export const fetchBranchTeam = (params) => api.get('/team', { params });

export const fetchBranchTeamMember = (userId) => api.get(`/team/${userId}`);
