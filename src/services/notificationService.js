import api from './api.js';

export const fetchNotifications = (params, config) =>
  api.get('/notifications', { params, ...config });

export const markNotificationRead = (id) => api.patch(`/notifications/${id}/read`);

export const markAllNotificationsRead = () => api.patch('/notifications/read-all');
