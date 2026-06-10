import api from './api.js';

export const fetchNotifications = (params) => api.get('/notifications', { params });

export const markNotificationRead = (id) => api.patch(`/notifications/${id}/read`);

export const markAllNotificationsRead = () => api.patch('/notifications/read-all');
