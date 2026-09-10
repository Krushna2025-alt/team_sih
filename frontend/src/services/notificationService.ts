import { getData, patchData } from './api';
import type { AppNotification } from '../types';

export const getNotifications = async (): Promise<AppNotification[]> => {
  try {
    const res = await getData('/notifications');
    return Array.isArray(res) ? res : [];
  } catch (err) {
    return [];
  }
};

export const markRead = async (id: string) => {
  try {
    return await patchData(`/notifications/${id}/read`);
  } catch {
    return null;
  }
};

export const markAllRead = async () => {
  try {
    return await patchData('/notifications/read-all');
  } catch {
    return null;
  }
};

