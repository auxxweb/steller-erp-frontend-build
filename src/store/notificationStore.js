import { create } from 'zustand';
import {
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '../services/notificationService.js';

const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,

  load: async (params = {}) => {
    set({ loading: true });
    try {
      const res = await fetchNotifications(params);
      const { notifications, unreadCount } = res.data.data;
      set({ notifications, unreadCount, loading: false });
      return notifications;
    } catch {
      set({ loading: false });
      return [];
    }
  },

  markRead: async (id) => {
    await markNotificationRead(id);
    set((s) => ({
      notifications: s.notifications.map((n) =>
        n.id === id ? { ...n, isRead: true } : n,
      ),
      unreadCount: Math.max(0, s.unreadCount - 1),
    }));
  },

  markAllRead: async () => {
    await markAllNotificationsRead();
    set((s) => ({
      notifications: s.notifications.map((n) => ({ ...n, isRead: true })),
      unreadCount: 0,
    }));
  },
}));

export default useNotificationStore;
