const { supabaseAdmin } = require('../config/supabase');
const { haversineKm, todayISO } = require('../utils/distance');
const { DEFAULT_RADIUS_KM } = require('./matchingService');

// Decision support ONLY. Never guarantees profit / earnings / forced price.
async function getRecommendationsForFarmer(farmer, radiusKm = DEFAULT_RADIUS_KM) {
  const { data: listings } = await supabaseAdmin
    .from('listings')
    .select('id, product_id, quantity_kg, price_per_kg, products(name)')
    .eq('farmer_id', farmer.id).eq('status', 'active').gte('availability_date', todayISO());
  if (!listings?.length) return { nearby_demand: 0, potential_buyers: 0, price_range: null, opportunities: [], radius_km: radiusKm, disclaimer: 'Guidance only - not guaranteed profit or earnings.' };

  const productIds = [...new Set(listings.map((l) => l.product_id))];
  const { data: demands } = await supabaseAdmin
    .from('demands')
    .select('id, product_id, quantity_kg, min_price, max_price, required_date, buyers(institution_name, latitude, longitude, reliability_score)')
    .in('product_id', productIds).eq('status', 'open').gte('required_date', todayISO());

  const nearby = (demands || []).map((d) => ({ ...d, distance_km: haversineKm(farmer.latitude, farmer.longitude, d.buyers?.latitude, d.buyers?.longitude) }))
    .filter((d) => d.distance_km != null && d.distance_km <= radiusKm);

  const mins = nearby.map((d) => d.min_price).filter((v) => v != null);
  const maxs = nearby.map((d) => d.max_price).filter((v) => v != null);
  const price_range = { min: mins.length ? Math.min(...mins) : null, max: maxs.length ? Math.max(...maxs) : null, sample_size: nearby.length };

  const opportunities = nearby
    .sort((a, b) => a.distance_km - b.distance_km).slice(0, 5)
    .map((d) => {
      const listing = listings.find((l) => l.product_id === d.product_id) || {};
      const reasons = [];
      if (d.distance_km <= 20) reasons.push('short distance');
      if ((d.buyers.reliability_score ?? 0) >= 4) reasons.push('high buyer reliability');
      if (d.max_price != null && listing.price_per_kg != null && d.max_price >= listing.price_per_kg) reasons.push('price within demand budget');
      return {
        buyer: { name: d.buyers.institution_name },
        product: listing.products?.name,
        distance_km: d.distance_km,
        reliability: d.buyers.reliability_score,
        quantity_kg: d.quantity_kg,
        required_date: d.required_date,
        reasons,
      };
    });

  return {
    nearby_demand: nearby.length,
    potential_buyers: new Set(nearby.map((d) => d.buyers.institution_name)).size,
    price_range, opportunities, radius_km: radiusKm,
    disclaimer: 'Guidance only - not guaranteed profit or earnings. The farmer makes the final decision.',
  };
}

module.exports = { getRecommendationsForFarmer };

