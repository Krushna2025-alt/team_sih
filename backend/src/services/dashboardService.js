const { supabaseAdmin } = require('../config/supabase');
const AppError = require('../utils/appError');
const { haversineKm, todayISO } = require('../utils/distance');
const { getRecommendationsForFarmer } = require('./recommendationService');
const { getFarmerByUser, getBuyerByUser } = require('./profileService');

const countWhere = async (table, column, value) =>
  (await supabaseAdmin.from(table).select('*', { count: 'exact', head: true }).eq(column, value)).count || 0;

async function farmerDashboard(userId) {
  const farmer = await getFarmerByUser(userId);
  if (!farmer) throw new AppError('Farmer profile required.', 403);

  const totalListings = await countWhere('listings', 'farmer_id', farmer.id);
  const activeListings = (await supabaseAdmin.from('listings')
    .select('*', { count: 'exact', head: true }).eq('farmer_id', farmer.id).eq('status', 'active')).count || 0;

  const orderStats = {};
  for (const s of ['pending', 'confirmed', 'dispatched', 'delivered', 'rejected', 'cancelled']) {
    orderStats[s] = (await supabaseAdmin.from('orders')
      .select('*', { count: 'exact', head: true }).eq('farmer_id', farmer.id).eq('status', s)).count || 0;
  }

  const { data: earnings } = await supabaseAdmin.from('farmer_earnings')
    .select('gross_amount, net_amount').eq('farmer_id', farmer.id);
  const gross = (earnings || []).reduce((a, e) => a + Number(e.gross_amount), 0);
  const net = (earnings || []).reduce((a, e) => a + Number(e.net_amount), 0);

  const unread = (await supabaseAdmin.from('notifications')
    .select('*', { count: 'exact', head: true }).eq('user_id', userId).eq('is_read', false)).count || 0;

  let opportunities = [];
  try { opportunities = (await getRecommendationsForFarmer(farmer)).opportunities; } catch (_e) { /* decision support is optional */ }

  return {
    profile: farmer,
    stats: {
      listings: { total: totalListings, active: activeListings },
      orders: orderStats,
      earnings: { gross: Math.round(gross * 100) / 100, net: Math.round(net * 100) / 100 },
      unread_notifications: unread,
    },
    opportunities,
  };
}

async function buyerDashboard(userId) {
  const buyer = await getBuyerByUser(userId);
  if (!buyer) throw new AppError('Buyer profile required.', 403);

  const orderStats = {};
  for (const s of ['pending', 'confirmed', 'dispatched', 'delivered', 'rejected', 'cancelled']) {
    orderStats[s] = (await supabaseAdmin.from('orders')
      .select('*', { count: 'exact', head: true }).eq('buyer_id', buyer.id).eq('status', s)).count || 0;
  }
  const openDemands = (await supabaseAdmin.from('demands')
    .select('*', { count: 'exact', head: true }).eq('buyer_id', buyer.id).eq('status', 'open')).count || 0;

  const { data: orders } = await supabaseAdmin.from('orders').select('total_amount').eq('buyer_id', buyer.id);
  const spend = (orders || []).reduce((a, o) => a + Number(o.total_amount), 0);

  const unread = (await supabaseAdmin.from('notifications')
    .select('*', { count: 'exact', head: true }).eq('user_id', userId).eq('is_read', false)).count || 0;

  const { data: nearbyListings } = await supabaseAdmin
    .from('listings')
    .select('id, farmers(latitude, longitude)')
    .eq('status', 'active').gte('availability_date', todayISO()).limit(200);
  const nearbyActiveListings = (nearbyListings || []).filter((l) => {
    const km = haversineKm(buyer.latitude, buyer.longitude, l.farmers?.latitude, l.farmers?.longitude);
    return km != null && km <= 50;
  }).length;

  return {
    profile: buyer,
    stats: {
      orders: orderStats,
      demands: { open: openDemands },
      total_spend: Math.round(spend * 100) / 100,
      nearby_active_listings: nearbyActiveListings,
      unread_notifications: unread,
    },
  };
}

module.exports = { farmerDashboard, buyerDashboard };

