import { supabase } from './supabaseClient';
import { getSessionUser } from './authService';
import type { AdminStats, BuyerStats, FarmerStats } from '../types';

export const getFarmerDashboard = async (): Promise<FarmerStats> => {
  const emptyStats: FarmerStats = {
    activeListings: 0,
    availableQtyKg: 0,
    orders: 0,
    weeklyRevenue: 0,
    revenue: 0,
    totalRevenue: 0,
    estimatedProfit: 0,
    pendingPayments: 0,
    completedOrders: 0,
    pendingOrders: 0,
    totalSales: 0,
    nearbyDemand: 0,
    bulkOpportunities: 0,
    rating: 5.0,
    weeklySales: [
      { day: 'Mon', amount: 0 },
      { day: 'Tue', amount: 0 },
      { day: 'Wed', amount: 0 },
      { day: 'Thu', amount: 0 },
      { day: 'Fri', amount: 0 },
      { day: 'Sat', amount: 0 },
      { day: 'Sun', amount: 0 },
    ],
  };

  if (!supabase) return emptyStats;

  try {
    const user = await getSessionUser();
    if (!user) return emptyStats;

    const { data: listings } = await supabase.from('farmer_listings').select('*').eq('farmer_id', user.id);
    const { data: orders } = await supabase.from('orders').select('*').eq('farmer_id', user.id);

    const activeListings = (listings || []).filter(l => l.status === 'Available' || l.status === 'active').length;
    const totalQty = (listings || []).reduce((acc, l) => acc + (Number(l.available_qty_kg) || 0), 0);
    const completedOrders = (orders || []).filter(o => o.status === 'delivered').length;
    const pendingOrders = (orders || []).filter(o => o.status === 'pending' || o.status === 'negotiating').length;
    const revenue = (orders || []).reduce((acc, o) => acc + (Number(o.total_price) || 0), 0);

    return {
      activeListings,
      availableQtyKg: totalQty,
      orders: (orders || []).length,
      weeklyRevenue: revenue,
      revenue: revenue,
      totalRevenue: revenue,
      estimatedProfit: Math.round(revenue * 0.35),
      pendingPayments: 0,
      completedOrders,
      pendingOrders,
      totalSales: (orders || []).length,
      nearbyDemand: 0,
      bulkOpportunities: 0,
      rating: 5.0,
      weeklySales: [
        { day: 'Mon', amount: 0 },
        { day: 'Tue', amount: 0 },
        { day: 'Wed', amount: 0 },
        { day: 'Thu', amount: 0 },
        { day: 'Fri', amount: 0 },
        { day: 'Sat', amount: 0 },
        { day: 'Sun', amount: 0 },
      ],
    };
  } catch (err) {
    console.error('Farmer dashboard error:', err);
    return emptyStats;
  }
};

export const getBuyerDashboard = async (): Promise<BuyerStats> => {
  const emptyBuyer: BuyerStats = {
    activeOrders: 0,
    monthlyProcurementKg: 0,
    monthlySpending: 0,
    savedFarmers: 0,
    recommendedFarmers: [],
  };

  if (!supabase) return emptyBuyer;

  try {
    const user = await getSessionUser();
    if (!user) return emptyBuyer;

    const { data: orders } = await supabase.from('orders').select('*').eq('buyer_id', user.id);
    const activeOrders = (orders || []).filter(o => o.status !== 'delivered' && o.status !== 'cancelled').length;
    const monthlySpending = (orders || []).reduce((acc, o) => acc + (Number(o.total_price) || 0), 0);
    const monthlyProcurementKg = (orders || []).reduce((acc, o) => acc + (Number(o.quantity_kg) || 0), 0);

    return {
      activeOrders,
      monthlyProcurementKg,
      monthlySpending,
      savedFarmers: 0,
      recommendedFarmers: [],
    };
  } catch (err) {
    console.error('Buyer dashboard error:', err);
    return emptyBuyer;
  }
};

export const getAdminAnalytics = async (): Promise<AdminStats> => {
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
};
