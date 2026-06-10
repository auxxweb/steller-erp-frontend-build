import api from './api.js';

export const applyLeave = (payload) => api.post('/leaves', payload);

export const fetchMyLeaves = (params) => api.get('/leaves/me', { params });

export const fetchLeaveRequests = (params) => api.get('/leaves', { params });

export const approveLeave = (leaveId) => api.patch(`/leaves/${leaveId}/approve`);

export const rejectLeave = (leaveId, rejectionReason) =>
  api.patch(`/leaves/${leaveId}/reject`, { rejectionReason });
