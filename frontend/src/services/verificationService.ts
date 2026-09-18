import { getData, postData } from './api';
import { VerificationReport } from '../types';

export const verificationService = {
  /**
   * Submit a new quality verification request
   */
  createVerification: async (data: {
    farmerId: string;
    productId?: string;
    productName: string;
    variety: string;
    quantityKg: number;
    location: string;
    expectedPrice: number;
    evidence: { type: string; url?: string; value?: number; unit?: string }[];
  }): Promise<VerificationReport & { ai_summary?: string }> => {
    return postData('/verifications', data);
  },

  /**
   * Fetch a verification report by ID
   */
  getVerification: async (id: string): Promise<VerificationReport> => {
    return getData(`/verifications/${id}`);
  }
};
