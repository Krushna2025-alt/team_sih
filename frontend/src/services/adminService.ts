import { getData, patchData, putData } from './apiHelper';
import type { AdminStats, AdminUser, Dispute, Listing, Order } from '../types';

export const getUsers = async (): Promise<AdminUser[]> => {
  try {
    const res = await getData('/admin/users');
    return Array.isArray(res) ? res : [];
  } catch {
    return [];
  }
};

export const verifyUser = async (id: string, verified: boolean): Promise<AdminUser> => {
  return await patchData(`/admin/users/${id}/verify`, { verified });
};

export const getAdminListings = async (): Promise<Listing[]> => {
  try {
    const res = await getData('/admin/listings');
    return Array.isArray(res) ? res : [];
  } catch {
    return [];
  }
};

export const getAdminOrders = async (): Promise<Order[]> => {
  try {
    const res = await getData('/admin/orders');
    return Array.isArray(res) ? res : [];
  } catch {
    return [];
  }
};

export const getDisputes = async (): Promise<Dispute[]> => {
  try {
    const res = await getData('/disputes');
    return Array.isArray(res) ? res : [];
  } catch {
    return [];
  }
};

export const resolveDispute = async (id: string, resolution: string): Promise<Dispute> => {
  return await patchData(`/disputes/${id}`, { resolution });
};

export const getAnalytics = async (): Promise<AdminStats> => {
  try {
    return await getData('/admin/analytics');
  } catch {
    return {
      totalUsers: 0,
      farmers: 0,
      buyers: 0,
      activeListings: 0,
      orders: 0,
      disputes: 0,
      transactionVolume: 0,
      weeklyOrders: [
        { day: 'Mon', amount: 0 },
        { day: 'Tue', amount: 0 },
        { day: 'Wed', amount: 0 },
        { day: 'Thu', amount: 0 },
        { day: 'Fri', amount: 0 },
        { day: 'Sat', amount: 0 },
        { day: 'Sun', amount: 0 },
      ],
    };
  }
};

export const updateSettings = async (body: Record<string, unknown>) => {
  return await putData('/admin/settings', body);
};

