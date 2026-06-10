import api from './api.js';

export const fetchUserAttendance = (userId, { year, month }) =>
  api.get(`/users/${userId}/attendance`, { params: { year, month } });

export const fetchMyAttendance = ({ year, month }) =>
  api.get('/attendance/me', { params: { year, month } });
