const { supabaseAdmin } = require('../config/supabase');
const { haversineKm, todayISO } = require('../utils/distance');

const DEFAULT_RADIUS_KM = 50;

// Buyer demand -> matching active listings (explainable, rule-based).
async function findMatchingListingsForDemand(demand, buyer, radiusKm = DEFAULT_RADIUS_KM) {
  let query = supabaseAdmin
    .from('listings')
    .select('*, products(name, unit), farmers(id, farm_name, location, latitude, longitude, reliability_score, verified, user_id)')
    .eq('product_id', demand.product_id)
    .eq('status', 'active')
    .gte('availability_date', todayISO())
    .gte('quantity_kg', demand.quantity_kg);

  if (demand.max_price != null) query = query.lte('price_per_kg', demand.max_price);

  const { data: listings, error } = await query;
  if (error) throw error;

  return (listings || [])
    .map((l) => {
      const km = haversineKm(buyer.latitude, buyer.longitude, l.farmers.latitude, l.farmers.longitude);
      const reasons = [];
      if (km != null && km <= radiusKm) reasons.push('within ' + radiusKm + 'km (' + km + 'km)');
      reasons.push('quantity available');
      if (demand.max_price != null) reasons.push('price within budget');
      if (l.farmers.verified) reasons.push('verified farmer');
      return { listing: { id: l.id, quantity_kg: l.quantity_kg, price_per_kg: l.price_per_kg, quality_grade: l.quality_grade, availability_date: l.availability_date, product: l.products }, farmer: l.farmers, distance_km: km, reasons };
    })
    .filter((m) => m.distance_km != null && m.distance_km <= radiusKm)
    .sort((a, b) => a.distance_km - b.distance_km);
}

// Farmer -> open demands matching the farmer's active listings.
async function findMatchingDemandsForFarmer(farmer, radiusKm = DEFAULT_RADIUS_KM) {
  const { data: listings } = await supabaseAdmin
    .from('listings')
    .select('product_id, quantity_kg, price_per_kg')
    .eq('farmer_id', farmer.id)
    .eq('status', 'active')
    .gte('availability_date', todayISO());

  const productIds = [...new Set((listings || []).map((l) => l.product_id))];
  if (!productIds.length) return [];

  const { data: demands, error } = await supabaseAdmin
    .from('demands')
    .select('*, products(name, unit), buyers(institution_name, latitude, longitude, reliability_score)')
    .in('product_id', productIds)
    .eq('status', 'open')
    .gte('required_date', todayISO());
  if (error) throw error;

  const byProduct = new Map((listings || []).map((l) => [l.product_id, l]));
  return (demands || [])
    .map((d) => {
      const listing = byProduct.get(d.product_id);
      const km = haversineKm(farmer.latitude, farmer.longitude, d.buyers?.latitude, d.buyers?.longitude);
      const reasons = [];
      let matched = true;
      if (listing && d.max_price != null && listing.price_per_kg > d.max_price) matched = false;
      else if (listing && d.max_price != null) reasons.push('price compatible');
      if (listing && d.quantity_kg <= listing.quantity_kg) reasons.push('stock available');
      if (km != null && km <= radiusKm) reasons.push('within ' + radiusKm + 'km (' + km + 'km)');
      return { demand: { id: d.id, quantity_kg: d.quantity_kg, min_price: d.min_price, max_price: d.max_price, required_date: d.required_date, delivery_address: d.delivery_address, product: d.products }, buyer: d.buyers, distance_km: km, reasons, matched: matched && km != null && km <= radiusKm };
    })
    .filter((m) => m.matched)
    .sort((a, b) => a.distance_km - b.distance_km);
}

module.exports = { findMatchingListingsForDemand, findMatchingDemandsForFarmer, DEFAULT_RADIUS_KM };

