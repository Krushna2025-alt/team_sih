const { supabaseAdmin } = require('../config/supabase');
const { ok, created, fail } = require('../utils/response');
const AppError = require('../utils/appError');
const { parsePagination, paginationMeta } = require('../utils/pagination');
const { getBuyerByUser, getFarmerByUser } = require('../services/profileService');
const matchingService = require('../services/matchingService');
const notificationService = require('../services/notificationService');

// POST /api/v1/demands - buyer only. Notifies matching farmers.
async function create(req, res, next) {
  try {
    const buyer = await getBuyerByUser(req.user.id);
    if (!buyer) throw new AppError('Buyer profile required.', 403);

    const { data: product } = await supabaseAdmin.from('products').select('id, name').eq('id', req.body.product_id).single();
    if (!product) throw new AppError('Product not found.', 404);

    const { data: demand, error } = await supabaseAdmin.from('demands').insert({
      buyer_id: buyer.id, product_id: req.body.product_id, quantity_kg: req.body.quantity_kg,
      min_price: req.body.min_price ?? null, max_price: req.body.max_price ?? null,
      required_date: req.body.required_date, delivery_address: req.body.delivery_address, notes: req.body.notes ?? null,
    }).select('*, products(name, unit)').single();
    if (error) throw error;

    const matches = await matchingService.findMatchingListingsForDemand(demand, buyer);
    await notificationService.createMany(matches.slice(0, 20).map((m) => ({
      user_id: m.farmer.user_id, type: 'matching_demand', title: 'New demand matches your produce',
      message: buyer.institution_name + ' needs ' + demand.quantity_kg + 'kg ' + product.name + ' by ' + demand.required_date + '.',
    })));

    return created(res, { demand, matched_farmers: matches.length });
  } catch (err) { next(err); }
}

// GET /api/v1/demands (own)
async function listMine(req, res, next) {
  try {
    const { page, limit, offset } = parsePagination(req.validatedQuery || {});
    let query = supabaseAdmin.from('demands').select('*, products(name, unit)', { count: 'exact' });
    if (req.user.role === 'buyer') {
      const buyer = await getBuyerByUser(req.user.id);
      query = query.eq('buyer_id', buyer?.id || '00000000-0000-0000-0000-000000000000');
    } else {
      return fail(res, 'Only buyers list their own demands here. Farmers use /demands/matches.', 403);
    }
    const { data, count, error } = await query.order('created_at', { ascending: false }).range(offset, offset + limit - 1);
    if (error) throw error;
    return ok(res, data || [], 200, paginationMeta(count || 0, page, limit));
  } catch (err) { next(err); }
}

// GET /api/v1/demands/matches
async function matches(req, res, next) {
  try {
    if (req.user.role === 'farmer') {
      const farmer = await getFarmerByUser(req.user.id);
      if (!farmer) throw new AppError('Farmer profile required.', 403);
      const results = await matchingService.findMatchingDemandsForFarmer(farmer);
      return ok(res, results.map(({ matched, ...r }) => r));
    }
    if (req.user.role === 'buyer') {
      const demandId = (req.validatedQuery || {}).demand_id;
      if (!demandId) throw new AppError('demand_id query parameter is required.', 400);
      const buyer = await getBuyerByUser(req.user.id);
      const { data: demand } = await supabaseAdmin.from('demands').select('*').eq('id', demandId).single();
      if (!demand) throw new AppError('Demand not found.', 404);
      if (demand.buyer_id !== buyer.id) return fail(res, 'You can only view matches for your own demands.', 403);
      const results = await matchingService.findMatchingListingsForDemand(demand, buyer);
      return ok(res, results);
    }
    return fail(res, 'Forbidden.', 403);
  } catch (err) { next(err); }
}

async function update(req, res, next) {
  try {
    const buyer = await getBuyerByUser(req.user.id);
    if (!buyer) throw new AppError('Buyer profile required.', 403);
    const { data: demand } = await supabaseAdmin.from('demands').select('id, buyer_id').eq('id', req.params.id).single();
    if (!demand) throw new AppError('Demand not found.', 404);
    if (demand.buyer_id !== buyer.id) return fail(res, 'You can only update your own demands.', 403);
    const { data: updated, error } = await supabaseAdmin.from('demands').update(req.body).eq('id', demand.id).select('*').single();
    if (error) throw error;
    return ok(res, updated);
  } catch (err) { next(err); }
}

module.exports = { create, listMine, matches, update };

