// SmartDealScore - explainable, rule-based, every factor normalized 0-100.
// 0.40 Price + 0.20 Quantity + 0.15 Distance + 0.10 Delivery + 0.15 BuyerReliability
const clamp = (n) => Math.max(0, Math.min(100, Math.round(n)));

const priceScore = (offered, base) => {
  if (!offered || !base || base <= 0) return 50;
  return clamp(50 + ((offered - base) / base) * 150);
};

const quantityScore = (offered, target, minQty) => {
  if (minQty && offered < minQty) return 0;
  if (!target) return 50;
  return clamp((Math.min(offered, target) / target) * 100);
};

const distanceScore = (km, radiusKm = 50) => {
  if (km === null || km === undefined || Number.isNaN(km)) return 50;
  return clamp((1 - Math.min(km, radiusKm) / radiusKm) * 100);
};

const deliveryScore = (deliveryDate) => {
  if (!deliveryDate) return 50;
  const days = (new Date(deliveryDate).getTime() - Date.now()) / 86400000;
  if (days <= 1) return 100;
  if (days <= 3) return 80;
  if (days <= 7) return 60;
  if (days <= 14) return 40;
  return 20;
};

const reliabilityScore = (rating) => clamp((((rating === null || rating === undefined) ? 3 : rating) / 5) * 100);

function computeSmartDealScore(input) {
  const f = {
    price: priceScore(input.offered_price, input.base_price),
    quantity: quantityScore(input.offered_quantity, input.deal_quantity, input.min_quantity_kg),
    distance: distanceScore(input.distance_km, input.radius_km || 50),
    delivery: deliveryScore(input.delivery_date),
    reliability: reliabilityScore(input.buyer_rating),
  };
  const smart_score = Math.round(0.40 * f.price + 0.20 * f.quantity + 0.15 * f.distance + 0.10 * f.delivery + 0.15 * f.reliability);
  const score_reasons = [];
  if (f.price >= 65) score_reasons.push('higher offered price');
  if (f.quantity >= 99) score_reasons.push('meets full deal quantity');
  if (input.distance_km != null && input.distance_km <= 20) score_reasons.push('short delivery distance');
  if (f.delivery >= 80) score_reasons.push('fast delivery commitment');
  if ((input.buyer_rating ?? 0) >= 4) score_reasons.push('high buyer reliability');
  if (!score_reasons.length) score_reasons.push('balanced offer across price, quantity and distance');
  return { smart_score, score_reasons };
}

module.exports = { computeSmartDealScore, distanceScore, reliabilityScore };

