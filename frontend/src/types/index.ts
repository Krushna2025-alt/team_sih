export type Role = 'farmer' | 'buyer' | 'admin';
export type Quality = 'A' | 'B' | 'C';
export type OrderStatus = 'pending' | 'negotiating' | 'confirmed' | 'dispatched' | 'delivered' | 'rejected' | 'cancelled';
export type DeliveryType = 'pickup' | 'delivery';
export interface User {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  role: Role;
  verified: boolean;
  rating?: number;
  reliability?: number;
  location?: string;
  village?: string;
  district?: string;
  state?: string;
  pincode?: string;
  latitude?: number;
  longitude?: number;
}
export interface Listing {
  id: string;
  farmerId: string;
  farmerName: string;
  product: string;
  quantityKg: number;
  availableQtyKg: number;
  pricePerKg: number;
  quality: Quality;
  availableFrom: string;
  delivery: DeliveryType;
  images: string[];
  status: 'active' | 'inactive' | 'Available' | 'Sold' | string;
  location?: string;
  latitude?: number;
  longitude?: number;
  distanceKm?: number;
  createdAt: string;
  verificationId?: string;
}
export interface Product extends Listing {
  farmerVerified: boolean;
  farmerRating: number;
  farmerReliability: number;
  farmerPhone?: string;
  farmerEmail?: string;
  verification?: VerificationReport;
}
export interface OrderItem { id: string; productId: string; productName: string; quantityKg: number; pricePerKg: number; }
export interface Order {
id: string; role?: Role; counterpartyName: string; items: OrderItem[];
subtotal: number; deliveryFee: number; total: number; status: OrderStatus;
deliveryType: DeliveryType; deliveryDate: string; address: string;
createdAt: string; canRate?: boolean; hasRated?: boolean;
negotiationPrice?: number;
negotiationBy?: 'farmer' | 'buyer';
}
export interface Demand {
id: string; buyerId: string; buyerName: string; product: string; quantityKg: number;
requiredDate: string; minPricePerKg: number; maxPricePerKg: number; address: string;
notes?: string; status: 'open' | 'matched' | 'closed'; distanceKm?: number; createdAt: string;
}
export interface DemandMatch {
id: string; product: string; quantityKg: number; requiredDate: string;
minPricePerKg: number; maxPricePerKg: number; distanceKm: number;
buyerName: string; buyerVerified: boolean; address: string; notes?: string;
buyerPhone?: string; buyerEmail?: string;
}
export interface BulkOffer {
id: string; dealId: string; buyerName: string; qtyKg: number; pricePerKg: number;
deliveryDate: string; score: number; reasons: string[]; status: 'pending' | 'accepted' | 'rejected';
}
export interface BulkDeal {
id: string; farmerId: string; farmerName: string; product: string;
totalQtyKg: number; minOrderQtyKg: number; basePricePerKg: number; closingDate: string;
status: 'open' | 'closed'; offers: BulkOffer[]; createdAt: string;
}
export interface AppNotification {
id: string; type: 'order' | 'demand_match' | 'payment' | 'bulk_offer' | 'system';
title: string; body: string; read: boolean; createdAt: string;
}
export interface Dispute {
id: string; orderId: string; raisedBy: string; against: string;
reason: string; status: 'open' | 'resolved'; createdAt: string;
}
export interface AdminUser extends User { joinedAt: string; }
export interface FarmerStats {
activeListings: number; availableQtyKg: number; orders: number; weeklyRevenue: number;
revenue: number; totalRevenue: number; estimatedProfit: number; pendingPayments: number; completedOrders: number;
pendingOrders: number; totalSales: number; nearbyDemand: number; bulkOpportunities: number;
rating: number;
weeklySales: { day: string; amount: number }[];
}
export interface BuyerStats {
activeOrders: number; monthlyProcurementKg: number; monthlySpending: number;
savedFarmers: number;
recommendedFarmers: { id: string; name: string; rating: number; reliability: number; verified: boolean; distanceKm: number; topProduct: string; }[];
}
export interface AdminStats {
totalUsers: number; farmers: number; buyers: number; activeListings: number;
orders: number; disputes: number; transactionVolume: number;
weeklyOrders: { day: string; amount: number }[];
}
export interface VoiceExtractionResult {
product: string; quantityKg: number; unit: string; pricePerKg: number;
location: string; availableFrom: string; transcript: string;
}
export interface RatingInput { orderId: string; stars: number; comment?: string; }
export interface ProductFilters {
search?: string; maxPrice?: number; quality?: Quality | '';
maxDistanceKm?: number; sort?: 'distance' | 'price' | 'quality' | 'newest';
}

export interface VerificationEvidence {
  id: string;
  verificationId: string;
  type: 'image' | 'video' | 'measurement' | 'lab_report';
  url?: string;
  value?: number;
  unit?: string;
  metadata?: any;
  createdAt: string;
}

export interface VerificationReport {
  id: string;
  farmerId: string;
  productId?: string;
  productName: string;
  variety?: string;
  quantityKg: number;
  location: string;
  status: 'pending' | 'completed' | 'failed';
  visualGrade?: string;
  visualScore?: number;
  issues?: string[];
  confidenceScore?: number;
  level: 1 | 2 | 3;
  trustScore: number;
  expectedPrice?: number;
  suggestedPriceMin?: number;
  suggestedPriceMax?: number;
  marketPriceMin?: number;
  marketPriceMax?: number;
  marketPriceSource?: string;
  createdAt: string;
  updatedAt: string;
  evidence?: VerificationEvidence[];
}
