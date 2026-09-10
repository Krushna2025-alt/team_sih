import { getData, patchData, postData } from './api';
import type { BulkDeal, BulkOffer } from '../types';

export const getDeals = async (): Promise<BulkDeal[]> => {
  try {
    const res = await getData('/bulk-deals');
    return Array.isArray(res) ? res : [];
  } catch {
    return [];
  }
};

export const getDeal = async (id: string): Promise<BulkDeal> => {
  try {
    return await getData(`/bulk-deals/${id}`);
  } catch {
    throw new Error('Deal not found');
  }
};

export const createDeal = async (body: Partial<BulkDeal>): Promise<BulkDeal> => {
  try {
    return await postData('/bulk-deals', body);
  } catch {
    throw new Error('Failed to create deal');
  }
};

export const submitOffer = async (dealId: string, body: { qtyKg: number; pricePerKg: number; deliveryDate: string }): Promise<BulkOffer> => {
  try {
    return await postData(`/bulk-deals/${dealId}/offers`, body);
  } catch {
    throw new Error('Failed to submit offer');
  }
};

export const respondOffer = async (offerId: string, status: 'accepted' | 'rejected'): Promise<BulkOffer> => {
  try {
    return await patchData(`/bulk-offers/${offerId}`, { status });
  } catch {
    throw new Error('Failed to respond to offer');
  }
};

