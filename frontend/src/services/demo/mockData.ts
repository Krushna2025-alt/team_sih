import type {
AdminStats, AdminUser, AppNotification, BulkDeal, BuyerStats, Demand,
DemandMatch, Dispute, FarmerStats, Listing, Order, Product,
} from '../../types';
export const demoListings: Listing[] = [
{ id: 'l1', farmerId: 'f1', farmerName: 'Ramesh Patil', product: 'Tomato', quantityKg: 500, availableQtyKg: 500, pricePerKg: 24, quality: 'A', availableFrom: '2025-01-10', delivery: 'delivery', images: [], status: 'active', distanceKm: 0, createdAt: '2025-01-05' },
{ id: 'l2', farmerId: 'f1', farmerName: 'Ramesh Patil', product: 'Onion', quantityKg: 1200, availableQtyKg: 1200, pricePerKg: 18, quality: 'B', availableFrom: '2025-01-12', delivery: 'pickup', images: [], status: 'active', distanceKm: 0, createdAt: '2025-01-06' },
{ id: 'l3', farmerId: 'f1', farmerName: 'Ramesh Patil', product: 'Wheat', quantityKg: 2000, availableQtyKg: 2000, pricePerKg: 28, quality: 'A', availableFrom: '2025-01-15', delivery: 'delivery', images: [], status: 'active', distanceKm: 0, createdAt: '2025-01-07' },
{ id: 'l4', farmerId: 'f1', farmerName: 'Ramesh Patil', product: 'Green Chilli', quantityKg: 150, availableQtyKg: 150, pricePerKg: 60, quality: 'A', availableFrom: '2025-01-08', delivery: 'pickup', images: [], status: 'inactive', distanceKm: 0, createdAt: '2025-01-03' },
{ id: 'l5', farmerId: 'f1', farmerName: 'Ramesh Patil', product: 'Banana', quantityKg: 800, availableQtyKg: 800, pricePerKg: 32, quality: 'B', availableFrom: '2025-01-11', delivery: 'delivery', images: [], status: 'active', distanceKm: 0, createdAt: '2025-01-08' },
{ id: 'l6', farmerId: 'f2', farmerName: 'Sunita Deshmukh', product: 'Rice', quantityKg: 5000, availableQtyKg: 5000, pricePerKg: 45, quality: 'A', availableFrom: '2025-01-20', delivery: 'pickup', images: [], status: 'active', distanceKm: 0, createdAt: '2025-01-09' },
{ id: 'l7', farmerId: 'f3', farmerName: 'Anil Shinde', product: 'Dal', quantityKg: 1000, availableQtyKg: 1000, pricePerKg: 85, quality: 'A', availableFrom: '2025-01-22', delivery: 'delivery', images: [], status: 'active', distanceKm: 0, createdAt: '2025-01-09' },
{ id: 'l8', farmerId: 'f4', farmerName: 'Prakash Rao', product: 'Cotton', quantityKg: 3000, availableQtyKg: 3000, pricePerKg: 65, quality: 'B', availableFrom: '2025-02-01', delivery: 'pickup', images: [], status: 'active', distanceKm: 0, createdAt: '2025-01-10' },
{ id: 'l9', farmerId: 'f1', farmerName: 'Ramesh Patil', product: 'Flour', quantityKg: 2000, availableQtyKg: 2000, pricePerKg: 35, quality: 'A', availableFrom: '2025-01-18', delivery: 'delivery', images: [], status: 'active', distanceKm: 0, createdAt: '2025-01-10' },
];
export const demoProducts: Product[] = [
{ ...demoListings[0], id: 'p1', farmerVerified: true, farmerRating: 4.6, farmerReliability: 95, distanceKm: 12, farmerPhone: '+91 98765 43210' },
{ ...demoListings[1], id: 'p2', farmerName: 'Sunita Deshmukh', farmerVerified: true, farmerRating: 4.3, farmerReliability: 90, distanceKm: 30, farmerPhone: '+91 98220 11223' },
{ ...demoListings[2], id: 'p3', farmerName: 'Anil Shinde', farmerVerified: true, farmerRating: 4.8, farmerReliability: 97, distanceKm: 45, farmerPhone: '+91 97640 55667' },
{ ...demoListings[4], id: 'p4', farmerVerified: true, farmerRating: 4.6, farmerReliability: 95, distanceKm: 8, farmerPhone: '+91 98765 43210' },
{ ...demoListings[5], id: 'p5', farmerName: 'Sunita Deshmukh', farmerVerified: true, farmerRating: 4.3, farmerReliability: 90, distanceKm: 25, farmerPhone: '+91 98220 11223' },
{ ...demoListings[6], id: 'p6', farmerName: 'Anil Shinde', farmerVerified: true, farmerRating: 4.8, farmerReliability: 97, distanceKm: 35, farmerPhone: '+91 97640 55667' },
{ ...demoListings[7], id: 'p7', farmerName: 'Prakash Rao', farmerVerified: false, farmerRating: 4.0, farmerReliability: 80, distanceKm: 50, farmerPhone: '+91 99887 76655' },
{ ...demoListings[8], id: 'p8', farmerVerified: true, farmerRating: 4.6, farmerReliability: 95, distanceKm: 10, farmerPhone: '+91 98765 43210' },
];
export const demoFarmerOrders: Order[] = [
{ id: 'o-f1', role: 'farmer', counterpartyName: 'Annapurna Foods', items: [{ id: 'i1', productId: 'p1', 
productName: 'Tomato', quantityKg: 100, pricePerKg: 24 }], subtotal: 2400, deliveryFee: 200, total: 
2600, status: 'pending', deliveryType: 'delivery', deliveryDate: '2025-01-15', address: 'Kothrud, Pune', createdAt: '2025-01-10', canRate: false, hasRated: false },
{ id: 'o-f2', role: 'farmer', counterpartyName: 'Hotel Green Leaf', items: [{ id: 'i2', productId: 'p2', 
productName: 'Onion', quantityKg: 200, pricePerKg: 18 }], subtotal: 3600, deliveryFee: 0, total: 
3600, status: 'confirmed', deliveryType: 'pickup', deliveryDate: '2025-01-16', address: 'Shivajinagar, Pune', createdAt: '2025-01-10', canRate: false, hasRated: false },
{ id: 'o-f3', role: 'farmer', counterpartyName: 'Annapurna Foods', items: [{ id: 'i3', productId: 'p3', 
productName: 'Wheat', quantityKg: 300, pricePerKg: 28 }], subtotal: 8400, deliveryFee: 0, total: 
8400, status: 'delivered', deliveryType: 'delivery', deliveryDate: '2025-01-08', address: 'Kothrud, Pune', createdAt: '2025-01-05', canRate: true, hasRated: false },
];
export const demoBuyerOrders: Order[] = [
{ id: 'o-b1', role: 'buyer', counterpartyName: 'Ramesh Patil', items: [{ id: 'i4', productId: 'p1', 
productName: 'Tomato', quantityKg: 80, pricePerKg: 24 }], subtotal: 1920, deliveryFee: 200, total: 
2120, status: 'dispatched', deliveryType: 'delivery', deliveryDate: '2025-01-14', address: 'MG Road, Pune', createdAt: '2025-01-10', canRate: false, hasRated: false },
{ id: 'o-b2', role: 'buyer', counterpartyName: 'Ramesh Patil', items: [{ id: 'i5', productId: 'p4', 
productName: 'Banana', quantityKg: 50, pricePerKg: 32 }], subtotal: 1600, deliveryFee: 200, total: 
1800, status: 'delivered', deliveryType: 'delivery', deliveryDate: '2025-01-07', address: 'MG Road, Pune', createdAt: '2025-01-04', canRate: true, hasRated: true },
{ id: 'o-b3', role: 'buyer', counterpartyName: 'Anil Shinde', items: [{ id: 'i6', productId: 'p6', 
productName: 'Potato', quantityKg: 150, pricePerKg: 16 }], subtotal: 2400, deliveryFee: 200, total: 
2600, status: 'pending', deliveryType: 'delivery', deliveryDate: '2025-01-17', address: 'MG Road, Pune', createdAt: '2025-01-11', canRate: false, hasRated: false },
];
export const demoDemands: Demand[] = [
{ id: 'dm1', buyerId: 'b1', buyerName: 'Annapurna Foods', product: 'Tomato', quantityKg: 500, 
requiredDate: '2025-01-20', minPricePerKg: 22, maxPricePerKg: 28, address: 'Market Yard, Pune', 
notes: 'Grade A preferred', status: 'open', createdAt: '2025-01-09' },
{ id: 'dm2', buyerId: 'b1', buyerName: 'Annapurna Foods', product: 'Onion', quantityKg: 800, 
requiredDate: '2025-02-01', minPricePerKg: 15, maxPricePerKg: 20, address: 'Market Yard, Pune', 
status: 'open', createdAt: '2025-01-10' },
{ id: 'dm3', buyerId: 'b1', buyerName: 'Annapurna Foods', product: 'Wheat', quantityKg: 1000, 
requiredDate: '2025-02-10', minPricePerKg: 25, maxPricePerKg: 30, address: 'Market Yard, Pune', 
status: 'matched', createdAt: '2025-01-08' },
];
export const demoMatches: DemandMatch[] = [
{ id: 'm1', product: 'Tomato', quantityKg: 500, requiredDate: '2025-01-20', minPricePerKg: 22, 
maxPricePerKg: 28, distanceKm: 12, buyerName: 'Annapurna Foods', buyerVerified: true, address: 
'Market Yard, Pune', notes: 'Grade A preferred' },
{ id: 'm2', product: 'Green Chilli', quantityKg: 150, requiredDate: '2025-01-22', minPricePerKg: 55, 
maxPricePerKg: 65, distanceKm: 30, buyerName: 'Hotel Green Leaf', buyerVerified: true, address: 
'Shivajinagar, Pune' },
{ id: 'm3', product: 'Potato', quantityKg: 400, requiredDate: '2025-01-25', minPricePerKg: 14, 
maxPricePerKg: 18, distanceKm: 18, buyerName: 'Annapurna Foods', buyerVerified: true, address: 
'Market Yard, Pune' },
];
export const demoBulkDeals: BulkDeal[] = [
{ id: 'bd1', farmerId: 'f1', farmerName: 'Ramesh Patil', product: 'Tomato', totalQtyKg: 1000, 
minOrderQtyKg: 100, basePricePerKg: 22, closingDate: '2025-01-25', status: 'open', createdAt: 
'2025-01-09', offers: [
{ id: 'bo1', dealId: 'bd1', buyerName: 'Annapurna Foods', qtyKg: 300, pricePerKg: 24, deliveryDate: 
'2025-01-28', score: 87, reasons: ['better_price', 'high_reliability'], status: 'pending' },
{ id: 'bo2', dealId: 'bd1', buyerName: 'Hotel Green Leaf', qtyKg: 200, pricePerKg: 21, deliveryDate: 
'2025-01-30', score: 72, reasons: ['shorter_distance', 'suitable_delivery'], status: 'pending' },
] },
{ id: 'bd2', farmerId: 'f2', farmerName: 'Sunita Deshmukh', product: 'Onion', totalQtyKg: 2000, 
minOrderQtyKg: 250, basePricePerKg: 15, closingDate: '2025-02-05', status: 'open', createdAt: 
'2025-01-10', offers: [] },
];
export const demoNotifications: AppNotification[] = [
{ id: 'n1', type: 'order', title: 'New order received', body: 'Annapurna Foods placed an order for Tomato (100 kg).', read: false, createdAt: '2025-01-10T09:30:00Z' },
{ id: 'n2', type: 'demand_match', title: 'New demand match', body: 'Hotel Green Leaf needs Green Chilli (150 kg) within 30 km.', read: false, createdAt: '2025-01-10T08:00:00Z' },
{ id: 'n3', type: 'bulk_offer', title: 'New bulk offer', body: 'An offer was submitted on your Tomato bulk deal.', read: false, createdAt: '2025-01-09T18:20:00Z' },
{ id: 'n4', type: 'payment', title: 'Payment confirmed', body: '₹8,400 received for order #o-f3.', read: true, createdAt: '2025-01-08T14:00:00Z' },
{ id: 'n5', type: 'system', title: 'Welcome to KrishiLink', body: 'Complete your profile to build trust with buyers.', read: true, createdAt: '2025-01-01T10:00:00Z' },
];
export const demoDisputes: Dispute[] = [
{ id: 'dp1', orderId: 'o-b2', raisedBy: 'Annapurna Foods', against: 'Ramesh Patil', reason: 'Banana quality was below Grade B.', status: 'open', createdAt: '2025-01-09' },
{ id: 'dp2', orderId: 'o-f1', raisedBy: 'Hotel Green Leaf', against: 'Anil Shinde', reason: 'Delivery was one day late.', status: 'resolved', createdAt: '2025-01-06' },
];
export const demoUsers: AdminUser[] = [
{ id: 'u1', name: 'Ramesh Patil', phone: '+91 98765 43210', role: 'farmer', verified: true, rating: 4.6, joinedAt: '2024-11-02' },
{ id: 'u2', name: 'Sunita Deshmukh', phone: '+91 98220 11223', role: 'farmer', verified: false, joinedAt: '2024-12-15' },
{ id: 'u3', name: 'Anil Shinde', phone: '+91 97640 55667', role: 'farmer', verified: true, rating: 4.8, joinedAt: '2024-10-20' },
{ id: 'u4', name: 'Annapurna Foods', email: 'orders@annapurna.in', role: 'buyer', verified: true, joinedAt: '2024-11-11' },
{ id: 'u5', name: 'Hotel Green Leaf', email: 'supply@greenleaf.in', role: 'buyer', verified: false, joinedAt: '2025-01-02' },
{ id: 'u6', name: 'Platform Admin', email: 'admin@krishilink.in', role: 'admin', verified: true, joinedAt: '2024-09-01' },
];
export const farmerDashboard = (): FarmerStats => ({
activeListings: 5, availableQtyKg: 4650, orders: 12, weeklyRevenue: 45000,
revenue: 125000, totalRevenue: 125000, estimatedProfit: 85000, pendingPayments: 12000, completedOrders: 45,
pendingOrders: 3, totalSales: 5400, nearbyDemand: 8, bulkOpportunities: 2,
rating: 4.8,
weeklySales: [
{ day: 'Mon', amount: 4500 }, { day: 'Tue', amount: 5200 }, { day: 'Wed', amount: 3800 },
{ day: 'Thu', amount: 6100 }, { day: 'Fri', amount: 4900 }, { day: 'Sat', amount: 7200 }, { day: 'Sun', amount: 8500 },
],
});
export const buyerDashboard = (): BuyerStats => ({
activeOrders: 4, monthlyProcurementKg: 2500, monthlySpending: 85000, savedFarmers: 12,
recommendedFarmers: [
{ id: 'f2', name: 'Sunita Deshmukh', rating: 4.8, reliability: 98, verified: true, distanceKm: 15, topProduct: 'Onion' },
{ id: 'f3', name: 'Anil Shinde', rating: 4.6, reliability: 95, verified: true, distanceKm: 22, topProduct: 'Wheat' },
],
});
export const demoFarmerStats: FarmerStats = {
activeListings: 4, availableQtyKg: 4650, orders: 3, weeklyRevenue: 18400,
revenue: 96200, totalRevenue: 96200, estimatedProfit: 21400, pendingPayments: 6200, completedOrders: 12,
pendingOrders: 3, totalSales: 48, nearbyDemand: 3, bulkOpportunities: 2,
rating: 4.8,
weeklySales: [{ day: 'Mon', amount: 1200 }, { day: 'Tue', amount: 2400 }, { day: 'Wed', amount: 1800 }, { day: 'Thu', amount: 3200 }, { day: 'Fri', amount: 2600 }, { day: 'Sat', amount: 4100 }, { day: 'Sun', amount: 3100 }],
};
export const demoBuyerStats: BuyerStats = {
activeOrders: 3, monthlyProcurementKg: 5400, monthlySpending: 128500, savedFarmers: 12,
recommendedFarmers: [
{ id: 'f1', name: 'Ramesh Patil', rating: 4.6, reliability: 95, verified: true, distanceKm: 12, topProduct: 'Tomato' },
{ id: 'f2', name: 'Sunita Deshmukh', rating: 4.3, reliability: 90, verified: true, distanceKm: 30, topProduct: 'Onion' },
{ id: 'f3', name: 'Anil Shinde', rating: 4.8, reliability: 97, verified: true, distanceKm: 45, topProduct: 'Wheat' },
],
};
export const demoAdminStats: AdminStats = {
totalUsers: 128, farmers: 86, buyers: 39, activeListings: 214,
orders: 342, disputes: 2, transactionVolume: 1850000,
weeklyOrders: [{ day: 'Mon', amount: 38 }, { day: 'Tue', amount: 52 }, { day: 'Wed', amount: 44 }, { day: 'Thu', amount: 61 }, { day: 'Fri', amount: 58 }, { day: 'Sat', amount: 72 }, { day: 'Sun', amount: 49 }],
};
