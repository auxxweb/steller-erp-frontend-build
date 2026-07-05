import api from './api.js';

export const fetchUserAttendance = (userId, { year, month }) =>
  api.get(`/users/${userId}/attendance`, { params: { year, month } });

export const fetchMyAttendance = ({ year, month }) =>
  api.get('/attendance/me', { params: { year, month } });

export const fetchTodayPunchStatus = (config) => api.get('/attendance/today', config);

export const punchAttendance = (action) => api.post('/attendance/punch', { action });

