const { test } = require('node:test');
const assert = require('node:assert');
const { haversineKm } = require('../src/utils/distance');
const { computeSmartDealScore, distanceScore } = require('../src/utils/scoring');
const { parsePagination, paginationMeta } = require('../src/utils/pagination');

test('haversine: Pune -> Mumbai is roughly 120km', () => {
  const km = haversineKm(18.5204, 73.8567, 19.076, 72.8777);
  assert.ok(km > 110 && km < 135, 'got ' + km);
});

test('haversine: zero distance', () => {
  assert.strictEqual(haversineKm(18.5, 73.8, 18.5, 73.8), 0);
});

test('haversine: missing coords returns null', () => {
  assert.strictEqual(haversineKm(null, 73.8, 18.5, 73.8), null);
});

test('SmartDealScore stays within 0-100 and gives reasons', () => {
  const { smart_score, score_reasons } = computeSmartDealScore({
    offered_price: 30, base_price: 25, offered_quantity: 100, deal_quantity: 100, min_quantity_kg: 50,
    distance_km: 10, delivery_date: new Date(Date.now() + 86400000).toISOString(), buyer_rating: 4.8,
  });
  assert.ok(smart_score >= 0 && smart_score <= 100);
  assert.ok(Array.isArray(score_reasons) && score_reasons.length > 0);
});

test('distance score at radius edge is 0', () => {
  assert.strictEqual(distanceScore(50, 50), 0);
  assert.strictEqual(distanceScore(0, 50), 100);
});

test('pagination defaults and clamping', () => {
  assert.deepStrictEqual(parsePagination({}), { page: 1, limit: 20, offset: 0 });
  assert.strictEqual(parsePagination({ limit: '500' }).limit, 100);
  assert.deepStrictEqual(paginationMeta(100, 1, 20), { page: 1, limit: 20, total: 100 });
});

