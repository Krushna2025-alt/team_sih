import { ApiError } from '../api';
import { todayISO } from '../../utils/format';
import type {
AdminStats, AdminUser, AppNotification, BulkDeal, BulkOffer, BuyerStats,
DeliveryType, Demand, DemandMatch, Dispute, FarmerStats, Listing, Order,
OrderStatus, Product, ProductFilters, Quality, VoiceExtractionResult,
} from '../../types';
import {
demoAdminStats, demoBulkDeals, demoBuyerOrders, demoBuyerStats, demoDemands,
demoDisputes, demoFarmerOrders, demoFarmerStats, demoListings, demoMatches,
demoNotifications, demoProducts, demoUsers,
} from './mockData';
const wait = (ms = 350) => new Promise((r) => setTimeout(r, ms));
let seq = 100;
const nid = () => `demo-${++seq}`;
const notFound = (): never => { throw new ApiError('Not found', 404, 'notFound'); };
/* ---------- Listings ---------- */
export async function myListings(): Promise<Listing[]> { await wait(); return [...demoListings]; }
export async function listing(id: string): Promise<Listing> {
await wait(); const l = demoListings.find((x) => x.id === id); if (!l) notFound(); return { ...l! };
}
export async function createListing(body: Partial<Listing>): Promise<Listing> {
await wait();
const l: Listing = {
id: nid(), farmerId: 'f1', farmerName: 'Ramesh Patil', product: String(body.product),
quantityKg: Number(body.quantityKg), availableQtyKg: Number(body.quantityKg),
pricePerKg: Number(body.pricePerKg), quality: (body.quality as Quality) || 'B',
availableFrom: String(body.availableFrom), delivery: (body.delivery as DeliveryType) || 'pickup',
images: body.images ?? [], status: 'active', distanceKm: 0, createdAt: new Date().toISOString(),
};
demoListings.unshift(l);
const newProduct = {
  ...l,
  farmerVerified: true,
  farmerRating: 5.0,
  farmerReliability: 100,
  distanceKm: 10,
  farmerPhone: '+91 00000 00000'
};
demoProducts.unshift(newProduct);
return l;
}
export async function updateListing(id: string, body: Partial<Listing>): Promise<Listing> {
await wait(); 
const l = demoListings.find((x) => x.id === id); 
if (!l) notFound();
Object.assign(l!, body); 
const p = demoProducts.find((x) => x.id === id);
if (p) Object.assign(p, body);
return { ...l! };
}
export const deactivateListing = (id: string) => updateListing(id, { status: 'inactive' });
export async function deleteListing(id: string) {
await wait(); 
const i = demoListings.findIndex((x) => x.id === id); 
if (i >= 0) demoListings.splice(i, 1);
const pi = demoProducts.findIndex((x) => x.id === id);
if (pi >= 0) demoProducts.splice(pi, 1);
}
/* ---------- Products (buyer browse) ---------- */
export async function products(f: ProductFilters): Promise<Product[]> {
await wait();
let arr = demoProducts.filter(p => p.status === 'active');
if (f.search) {
const s = f.search.toLowerCase();
arr = arr.filter((p) => p.product.toLowerCase().includes(s) || 
p.farmerName.toLowerCase().includes(s));
}
if (f.maxPrice) arr = arr.filter((p) => p.pricePerKg <= f.maxPrice!);
if (f.quality) arr = arr.filter((p) => p.quality === f.quality);
if (f.maxDistanceKm) arr = arr.filter((p) => (p.distanceKm ?? 999) <= f.maxDistanceKm!);
switch (f.sort) {
case 'price': arr.sort((a, b) => a.pricePerKg - b.pricePerKg); break;
case 'quality': arr.sort((a, b) => a.quality.localeCompare(b.quality)); break;
case 'newest': arr.sort((a, b) => b.createdAt.localeCompare(a.createdAt)); break;
default: arr.sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0));
}
return arr;
}
export async function product(id: string): Promise<Product> {
await wait(); const p = demoProducts.find((x) => x.id === id); if (!p) notFound(); return { ...p! };
}
/* ---------- Orders ---------- */
export async function myOrders(role: 'farmer' | 'buyer'): Promise<Order[]> {
await wait(); return [...(role === 'farmer' ? demoFarmerOrders : demoBuyerOrders)];
}
export async function order(id: string): Promise<Order> {
await wait();
const o = [...demoFarmerOrders, ...demoBuyerOrders].find((x) => x.id === id);
if (!o) notFound(); return { ...o! } as Order;
}
export async function createOrder(body: {
items: { listingId: string; quantityKg: number }[];
deliveryType: DeliveryType; deliveryDate: string; address: string; paymentMethod: string;
}): Promise<Order> {
await wait(600); // never retried automatically
const items = body.items.map((it) => {
const p = demoProducts.find((x) => x.id === it.listingId)!;
return { id: nid(), productId: p.id, productName: p.product, quantityKg: it.quantityKg, pricePerKg: p.pricePerKg };
});
const subtotal = items.reduce((s, i) => s + i.quantityKg * i.pricePerKg, 0);
const deliveryFee = subtotal >= 5000 ? 0 : 200;
const o: Order = {
id: nid(), role: 'buyer', counterpartyName: 'Ramesh Patil', items, subtotal, deliveryFee,
total: subtotal + deliveryFee, status: 'pending', deliveryType: body.deliveryType,
deliveryDate: body.deliveryDate, address: body.address, createdAt: new Date().toISOString(),
canRate: false, hasRated: false,
};
demoBuyerOrders.unshift(o);
demoFarmerOrders.unshift({ ...o, role: 'farmer', counterpartyName: 'Annapurna Foods' });
return o;
}
export async function updateOrderStatus(id: string, status: OrderStatus): Promise<Order> {
await wait();
const o = [...demoFarmerOrders, ...demoBuyerOrders].find((x) => x.id === id);
if (!o) notFound();
o!.status = status;
if (status === 'delivered') o!.canRate = true;
return { ...o! } as Order;
}

export async function negotiateOrder(id: string, negotiationPrice: number, negotiationBy: 'farmer' | 'buyer'): Promise<Order> {
await wait();
const o = [...demoFarmerOrders, ...demoBuyerOrders].find((x) => x.id === id);
if (!o) notFound();

// Find it in the specific arrays to update the actual reference if needed, 
// but since they hold references to the same objects (or we can just update the array elements directly)
const fOrder = demoFarmerOrders.find(x => x.id === id);
const bOrder = demoBuyerOrders.find(x => x.id === id);

if (fOrder) {
  fOrder.status = 'negotiating';
  fOrder.negotiationPrice = negotiationPrice;
  fOrder.negotiationBy = negotiationBy;
}
if (bOrder) {
  bOrder.status = 'negotiating';
  bOrder.negotiationPrice = negotiationPrice;
  bOrder.negotiationBy = negotiationBy;
}

return { ...o!, status: 'negotiating', negotiationPrice, negotiationBy } as Order;
}
export async function createDispute(body: { orderId: string; reason: string }): Promise<Dispute> {
await wait();
const dp: Dispute = {
id: nid(), orderId: body.orderId, raisedBy: 'Annapurna Foods', against: 'Ramesh Patil',
reason: body.reason, status: 'open', createdAt: new Date().toISOString(),
};
demoDisputes.unshift(dp);
return dp;
}
/* ---------- Demands ---------- */
export async function createDemand(body: Partial<Demand>): Promise<Demand> {
await wait();
const dm: Demand = {
id: nid(), buyerId: 'b1', buyerName: 'Annapurna Foods', product: String(body.product),
quantityKg: Number(body.quantityKg), requiredDate: String(body.requiredDate),
minPricePerKg: Number(body.minPricePerKg), maxPricePerKg: Number(body.maxPricePerKg),
address: String(body.address), notes: body.notes, status: 'open', createdAt: new Date().toISOString(),
};
demoDemands.unshift(dm);
return dm;
}
export async function myDemands(): Promise<Demand[]> { await wait(); return [...demoDemands]; }
export async function demandMatches(): Promise<DemandMatch[]> { await wait(); return [...demoMatches]; }
export async function updateDemand(id: string, body: Partial<Demand>): Promise<Demand> {
await wait(); const d = demoDemands.find((x) => x.id === id); if (!d) notFound();
Object.assign(d!, body); return { ...d! };
}
/* ---------- Bulk deals ---------- */
export async function bulkDeals(): Promise<BulkDeal[]> {
await wait(); return demoBulkDeals.map((d) => ({ ...d, offers: [...d.offers] }));
}
export async function bulkDeal(id: string): Promise<BulkDeal> {
await wait(); const d = demoBulkDeals.find((x) => x.id === id); if (!d) notFound();
return { ...d!, offers: [...d!.offers] };
}
export async function createDeal(body: Partial<BulkDeal>): Promise<BulkDeal> {
await wait();
const d: BulkDeal = {
id: nid(), farmerId: 'f1', farmerName: 'Ramesh Patil', product: String(body.product),
totalQtyKg: Number(body.totalQtyKg), minOrderQtyKg: Number(body.minOrderQtyKg),
basePricePerKg: Number(body.basePricePerKg), closingDate: String(body.closingDate),
status: 'open', offers: [], createdAt: new Date().toISOString(),
};
demoBulkDeals.unshift(d);
return d;
}
export async function submitOffer(dealId: string, body: { qtyKg: number; pricePerKg: number; deliveryDate: string }): Promise<BulkOffer> {
await wait();
const d = demoBulkDeals.find((x) => x.id === dealId); if (!d) notFound();
const pool = [['better_price', 'high_reliability'], ['shorter_distance', 'suitable_delivery'], ['better_quantity', 'high_reliability']];
const score = 70 + Math.floor(Math.random() * 25);
const off: BulkOffer = {
id: nid(), dealId, buyerName: 'Annapurna Foods', qtyKg: body.qtyKg, pricePerKg: body.pricePerKg,
deliveryDate: body.deliveryDate, score, reasons: pool[score % 3], status: 'pending',
};
d!.offers.push(off);
return off;
}
export async function respondOffer(offerId: string, status: 'accepted' | 'rejected'): Promise<BulkOffer> {
await wait();
for (const d of demoBulkDeals) {
const o = d.offers.find((x) => x.id === offerId);
if (o) { 
  o.status = status; 
  if (status === 'accepted') {
    // Generate an order for both farmer and buyer
    const subtotal = o.qtyKg * o.pricePerKg;
    const order: Order = {
      id: nid(),
      role: 'buyer',
      counterpartyName: d.farmerName,
      items: [{ id: nid(), productId: d.id, productName: d.product + " (Bulk)", quantityKg: o.qtyKg, pricePerKg: o.pricePerKg }],
      subtotal,
      deliveryFee: 0,
      total: subtotal,
      status: 'pending',
      deliveryType: 'delivery',
      deliveryDate: o.deliveryDate,
      address: 'Buyer Address',
      createdAt: new Date().toISOString(),
      canRate: false,
      hasRated: false
    };
    demoBuyerOrders.unshift(order);
    demoFarmerOrders.unshift({ ...order, role: 'farmer', counterpartyName: o.buyerName });
  }
  return { ...o }; 
}
}
return notFound() as any;
}
/* ---------- Dashboards ---------- */
export async function farmerDashboard(): Promise<FarmerStats> {
await wait(); return { ...demoFarmerStats, weeklySales: [...demoFarmerStats.weeklySales] };
}
export async function buyerDashboard(): Promise<BuyerStats> {
await wait(); return { ...demoBuyerStats, recommendedFarmers: [...demoBuyerStats.recommendedFarmers] };
}
export async function adminAnalytics(): Promise<AdminStats> {
await wait(); return { ...demoAdminStats, weeklyOrders: [...demoAdminStats.weeklyOrders] };
}
/* ---------- Admin ---------- */
export async function adminUsers(): Promise<AdminUser[]> { await wait(); return [...demoUsers]; }
export async function verifyUser(id: string, verified: boolean): Promise<AdminUser> {
await wait(); const u = demoUsers.find((x) => x.id === id); if (!u) notFound();
u!.verified = verified; return { ...u! };
}
export async function adminListings(): Promise<Listing[]> { await wait(); return [...demoListings]; }
export async function adminOrders(): Promise<Order[]> {
await wait(); return [...demoFarmerOrders, ...demoBuyerOrders];
}
export async function disputes(): Promise<Dispute[]> { await wait(); return [...demoDisputes]; }
export async function resolveDispute(id: string): Promise<Dispute> {
await wait(); const d = demoDisputes.find((x) => x.id === id); if (!d) notFound();
d!.status = 'resolved'; return { ...d! };
}
export async function updateSettings(_body: unknown) { await wait(); return { ok: true }; }
/* ---------- Notifications / Ratings / Voice ---------- */
export async function notifications(): Promise<AppNotification[]> { await wait(); return [...demoNotifications]; }
export async function markRead(id: string) {
await wait(150); const n = demoNotifications.find((x) => x.id === id); if (n) n.read = true;
}
export async function markAllRead() { await wait(150); demoNotifications.forEach((n) => (n.read = true)); }
export async function submitRating(p: { orderId: string }) {
await wait();
const o = [...demoFarmerOrders, ...demoBuyerOrders].find((x) => x.id === p.orderId);
if (o) o.hasRated = true;
return { ok: true };
}
export async function extractListing(): Promise<VoiceExtractionResult> {
await wait(1400);
return {
product: 'Tomato', quantityKg: 250, unit: 'kg', pricePerKg: 24,
location: 'Nashik, Maharashtra', availableFrom: todayISO(),
transcript: 'I have 250 kg of tomatoes ready from today, expecting around 24 rupees per kilo, near Nashik.',
};
}
