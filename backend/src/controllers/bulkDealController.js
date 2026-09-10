const { supabaseAdmin } = require('../config/supabase');
const { ok, created, fail } = require('../utils/response');
const AppError = require('../utils/appError');
const { haversineKm } = require('../utils/distance');
const { computeSmartDealScore } = require('../utils/scoring');
const { parsePagination, paginationMeta } = require('../utils/pagination');
const { getFarmerByUser, getBuyerByUser } = require('../services/profileService');
const notificationService = require('../services/notificationService');

// POST /api/v1/bulk-deals - farmer only.
async function createDeal(req, res, next) {
  try {
    const farmer = await getFarmerByUser(req.user.id);
    if (!farmer) throw new AppError('Farmer profile required.', 403);
    const { data: product } = await supabaseAdmin.from('products').select('id').eq('id', req.body.product_id).single();
    if (!product) throw new AppError('Product not found.', 404);
    if (new Date(req.body.closes_at).getTime() <= Date.now()) throw new AppError('closes_at must be in the future.', 422);

    const { data: deal, error } = await supabaseAdmin.from('bulk_deals').insert({ farmer_id: farmer.id, ...req.body }).select('*, products(name, unit)').single();
    if (error) throw error;
    return created(res, deal);
  } catch (err) { next(err); }
}

// GET /api/v1/bulk-deals
async function listDeals(req, res, next) {
  try {
    const q = req.validatedQuery || {};
    const { page, limit, offset } = parsePagination(q);
    let query = supabaseAdmin.from('bulk_deals')
      .select('*, products(name, unit), farmers(id, farm_name, latitude, longitude, reliability_score)', { count: 'exact' });
    if (q.mine === 'true' && req.user.role === 'farmer') {
      const farmer = await getFarmerByUser(req.user.id);
      query = query.eq('farmer_id', farmer?.id || '00000000-0000-0000-0000-000000000000');
    } else {
      query = query.eq('status', 'open').gt('closes_at', new Date().toISOString()); // expired deals never appear open
    }
    if (q.product_id) query = query.eq('product_id', q.product_id);
    const { data, count, error } = await query.order('created_at', { ascending: false }).range(offset, offset + limit - 1);
    if (error) throw error;
    return ok(res, data || [], 200, paginationMeta(count || 0, page, limit));
  } catch (err) { next(err); }
}

// POST /api/v1/bulk-deals/:id/offers - buyer only. SmartDealScore computed server-side.
async function createOffer(req, res, next) {
  try {
    const buyer = await getBuyerByUser(req.user.id);
    if (!buyer) throw new AppError('Buyer profile required.', 403);

    const { data: deal } = await supabaseAdmin.from('bulk_deals')
      .select('*, farmers(id, latitude, longitude)').eq('id', req.params.id).single();
    if (!deal) throw new AppError('Bulk deal not found.', 404);
    if (deal.status !== 'open') throw new AppError('This bulk deal is no longer open.', 409);
    if (new Date(deal.closes_at).getTime() <= Date.now()) throw new AppError('This bulk deal has closed.', 409);
    if (req.body.offered_quantity < deal.min_quantity_kg) throw new AppError('Minimum quantity for this deal is ' + deal.min_quantity_kg + 'kg.', 422);
    if (req.body.offered_quantity > deal.quantity_kg) throw new AppError('Deal quantity is ' + deal.quantity_kg + 'kg.', 422);

    const distance_km = haversineKm(deal.farmers.latitude, deal.farmers.longitude, buyer.latitude, buyer.longitude);
    const { smart_score, score_reasons } = computeSmartDealScore({
      offered_price: req.body.offered_price, base_price: deal.base_price,
      offered_quantity: req.body.offered_quantity, deal_quantity: deal.quantity_kg, min_quantity_kg: deal.min_quantity_kg,
      distance_km, delivery_date: req.body.delivery_date, buyer_rating: buyer.reliability_score,
    });

    const { data: offer, error } = await supabaseAdmin.from('bulk_offers').insert({
      bulk_deal_id: deal.id, buyer_id: buyer.id,
      offered_quantity: req.body.offered_quantity, offered_price: req.body.offered_price,
      delivery_date: req.body.delivery_date ?? null, smart_score, score_reasons,
    }).select('*').single();
    if (error) throw error;

    const { data: farmerUser } = await supabaseAdmin.from('farmers').select('user_id').eq('id', deal.farmer_id).single();
    await notificationService.create({ user_id: farmerUser.user_id, type: 'bulk_offer', title: 'New bulk offer', message: 'Score ' + smart_score + ': ' + req.body.offered_quantity + 'kg at Rs.' + req.body.offered_price + '/kg.' });
    return created(res, offer);
  } catch (err) { next(err); }
}

// PATCH /api/v1/bulk-offers/:id - farmer (accept/reject) or owning buyer (withdraw).
async function updateOffer(req, res, next) {
  try {
    const { action } = req.body;
    const { data: offer } = await supabaseAdmin.from('bulk_offers')
      .select('*, bulk_deals(id, farmer_id, status), buyers(user_id, institution_name)').eq('id', req.params.id).single();
    if (!offer) throw new AppError('Bulk offer not found.', 404);

    const farmer = await getFarmerByUser(req.user.id);
    const isFarmerOwner = farmer && offer.bulk_deals.farmer_id === farmer.id;
    const isOfferOwner = offer.buyers.user_id === req.user.id;
    if (!isFarmerOwner && !isOfferOwner) return fail(res, 'You cannot modify this offer.', 403);
    if (offer.status !== 'pending') throw new AppError('Offer is already ' + offer.status + '.', 409);

    if (action === 'withdraw') {
      if (!isOfferOwner) return fail(res, 'Only the offering buyer can withdraw.', 403);
      const { data } = await supabaseAdmin.from('bulk_offers').update({ status: 'withdrawn' }).eq('id', offer.id).select('*').single();
      return ok(res, data);
    }

    if (!isFarmerOwner) return fail(res, 'Only the farmer who created the deal can accept or reject offers.', 403);
    if (offer.bulk_deals.status !== 'open') throw new AppError('Deal is no longer open.', 409);

    const newStatus = action === 'accept' ? 'accepted' : 'rejected';
    const { data: updated, error } = await supabaseAdmin.from('bulk_offers').update({ status: newStatus }).eq('id', offer.id).select('*').single();
    if (error) throw error;

    if (newStatus === 'accepted') {
      await supabaseAdmin.from('bulk_deals').update({ status: 'awarded' }).eq('id', offer.bulk_deal_id);
      await supabaseAdmin.from('bulk_offers').update({ status: 'rejected' }).eq('bulk_deal_id', offer.bulk_deal_id).eq('status', 'pending');
    }
    await notificationService.create({
      user_id: offer.buyers.user_id, type: newStatus === 'accepted' ? 'bulk_offer_accepted' : 'bulk_offer_rejected',
      title: 'Bulk offer ' + newStatus, message: 'Your offer of ' + offer.offered_quantity + 'kg was ' + newStatus + '.',
    });
    return ok(res, updated);
  } catch (err) { next(err); }
}

module.exports = { createDeal, listDeals, createOffer, updateOffer };

