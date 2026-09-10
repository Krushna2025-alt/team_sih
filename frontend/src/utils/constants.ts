export const qk = {
products: (f: unknown = {}) => ['products', f] as const,
product: (id: string) => ['product', id] as const,
listings: (f: unknown = {}) => ['listings', f] as const,
listing: (id: string) => ['listing', id] as const,
orders: (role: string) => ['orders', role] as const,
order: (id: string) => ['order', id] as const,
demands: (role: string) => ['demands', role] as const,
demandMatches: () => ['demand-matches'] as const,
bulkDeals: (role: string) => ['bulk-deals', role] as const,
bulkDeal: (id: string) => ['bulk-deal', id] as const,
dashboard: (role: string) => ['dashboard', role] as const,
notifications: () => ['notifications'] as const,
adminUsers: () => ['admin', 'users'] as const,
adminListings: () => ['admin', 'listings'] as const,
adminOrders: () => ['admin', 'orders'] as const,
adminDisputes: () => ['admin', 'disputes'] as const,
adminAnalytics: () => ['admin', 'analytics'] as const,
};
const EMOJI: Record<string, string> = {
tomato: '🍅', onion: '🧅', wheat: '🌾', banana: '🍌', potato: '🥔',
chilli: '🌶️', rice: '🍚', mango: '🥭', orange: '🍊', garlic: '🧄',
dal: '🥣', flour: '🌾', cotton: '☁️', soybean: '🫘', sugarcane: '🎋',
};
export const productEmoji = (name: string) =>
EMOJI[name.toLowerCase().split(' ')[0]] ?? '📦';
