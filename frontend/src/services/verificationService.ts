import { getData, postData } from './api';
import { VerificationReport } from '../types';

const mapReport = (data: any): VerificationReport => ({
  id: data.id,
  farmerId: data.farmer_id,
  productId: data.product_id,
  productName: data.product_name,
  variety: data.variety,
  quantityKg: data.quantity_kg,
  location: data.location,
  status: data.status,
  visualGrade: data.visual_grade,
  visualScore: data.visual_score,
  issues: data.issues,
  confidenceScore: data.confidence_score,
  level: data.level,
  trustScore: data.trust_score,
  expectedPrice: data.expected_price,
  suggestedPriceMin: data.suggested_price_min,
  suggestedPriceMax: data.suggested_price_max,
  marketPriceMin: data.market_price_min,
  marketPriceMax: data.market_price_max,
  marketPriceSource: data.market_price_source,
  createdAt: data.created_at,
  updatedAt: data.updated_at,
  evidence: data.verification_evidence?.map((e: any) => ({
    id: e.id,
    verificationId: e.verification_id,
    type: e.type,
    url: e.url,
    value: e.value,
    unit: e.unit,
    createdAt: e.created_at
  })),
  ...data // keep anything else like ai_summary
});

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
    const res = await postData('/verifications', data);
    return mapReport(res) as VerificationReport & { ai_summary?: string };
  },

  /**
   * Fetch a verification report by ID
   */
  getVerification: async (id: string): Promise<VerificationReport> => {
    const res = await getData(`/verifications/${id}`);
    return mapReport(res);
  }
};
