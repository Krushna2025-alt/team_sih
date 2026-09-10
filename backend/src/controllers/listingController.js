const { supabaseAdmin } = require('../config/supabase');
const { ok, created, fail } = require('../utils/response');
const AppError = require('../utils/appError');
const { haversineKm, todayISO } = require('../utils/distance');
const { parsePagination, paginationMeta } = require('../utils/pagination');
const { getFarmerByUser } = require('../services/profileService');

// POST /api/v1/listings - farmer only. farmer_id comes from the authenticated user, NEVER the body.
async function create(req, res, next) {
  try {
    const farmer = await getFarmerByUser(req.user.id);
    if (!farmer) throw new AppError('Farmer profile required. Complete your profile first.', 403);

    const { data: product } = await supabaseAdmin.from('products').select('id').eq('id', req.body.product_id).single();
    if (!product) throw new AppError('Product not found.', 404);

    const { data: listing, error } = await supabaseAdmin.from('listings').insert({
      farmer_id: farmer.id,
      product_id: req.body.product_id,
      quantity_kg: req.body.quantity_kg,
      price_per_kg: req.body.price_per_kg,
      quality_grade: req.body.quality_grade,
      availability_date: req.body.availability_date,
      delivery_option: req.body.delivery_option,
    }).select('*, products(id, name, unit)').single();
    if (error) throw error;

    if (req.body.image_urls?.length) {
      await supabaseAdmin.from('product_images').insert(
        req.body.image_urls.map((url, i) => ({ listing_id: listing.id, image_url: url, sort_order: i }))
      );
    }
    return created(res, listing);
  } catch (err) { next(err); }
}

// GET /api/v1/listings - search/filter/sort with expiry enforced at query time.
async function list(req, res, next) {
  try {
    const q = req.validatedQuery || {};
    const { page, limit, offset } = parsePagination(q);
    const mine = q.mine === 'true' && req.user.role === 'farmer';

    let query = supabaseAdmin.from('listings')
      .select('*, products(id, name, unit), farmers!inner(id, user_id, farm_name, location, latitude, longitude, reliability_score, verified), product_images(image_url, sort_order)', { count: 'exact' });

    if (mine) {
      const farmer = await getFarmerByUser(req.user.id);
      query = query.eq('farmer_id', farmer?.id || '00000000-0000-0000-0000-000000000000');
      if (q.status) query = query.eq('status', q.status);
    } else {
      query = query.eq('status', 'active').gte('availability_date', todayISO()); // expired never appear active
    }

    if (q.product) query = query.eq('product_id', q.product);
    if (q.min_price != null) query = query.gte('price_per_kg', q.min_price);
    if (q.max_price != null) query = query.lte('price_per_kg', q.max_price);
    if (q.quality_grade) query = query.eq('quality_grade', q.quality_grade);
    if (q.availability_date) query = query.eq('availability_date', q.availability_date);

    const needsDistance = q.sort === 'distance' || (q.distance != null);
    if (needsDistance && (q.latitude == null || q.longitude == null)) {
      throw new AppError('latitude and longitude are required for distance sorting/filtering.', 400);
    }

    if (needsDistance) {
      // MVP: in-memory distance handling (bounded fetch). Swap for PostGIS later if needed.
      const { data: rows, error } = await query.limit(200);
      if (error) throw error;
      let enriched = rows.map((l) => ({ ...l, distance_km: haversineKm(q.latitude, q.longitude, l.farmers.latitude, l.farmers.longitude) }));
      if (q.distance != null) enriched = enriched.filter((l) => l.distance_km != null && l.distance_km <= q.distance);
      enriched.sort((a, b) => (a.distance_km ?? Infinity) - (b.distance_km ?? Infinity));
      const total = enriched.length;
      return ok(res, enriched.slice(offset, offset + limit), 200, paginationMeta(total, page, limit));
    }

    if (q.sort === 'price') query = query.order('price_per_kg', { ascending: true });
    else if (q.sort === 'quality') query = query.order('quality_grade', { ascending: true });
    else query = query.order('created_at', { ascending: false }); // newest default

    const { data, count, error } = await query.range(offset, offset + limit - 1);
    if (error) throw error;
    return ok(res, data || [], 200, paginationMeta(count || 0, page, limit));
  } catch (err) { next(err); }
}

async function getById(req, res, next) {
  try {
    const { data: listing, error } = await supabaseAdmin.from('listings')
      .select('*, products(id, name, unit), farmers(id, user_id, farm_name, location, latitude, longitude, reliability_score, verified), product_images(image_url, sort_order)')
      .eq('id', req.params.id).single();
    if (error || !listing) throw new AppError('Listing not found.', 404);
    return ok(res, listing);
  } catch (err) { next(err); }
}

async function update(req, res, next) {
  try {
    const farmer = await getFarmerByUser(req.user.id);
    if (!farmer) throw new AppError('Farmer profile required.', 403);

    const { data: listing } = await supabaseAdmin.from('listings').select('id, farmer_id').eq('id', req.params.id).single();
    if (!listing) throw new AppError('Listing not found.', 404);
    if (listing.farmer_id !== farmer.id) return fail(res, 'You can only update your own listings.', 403);

    const patch = { ...req.body };
    delete patch.image_urls;
    if (Object.keys(patch).length) {
      const { error } = await supabaseAdmin.from('listings').update(patch).eq('id', listing.id);
      if (error) throw error;
    }
    if (req.body.image_urls) {
      await supabaseAdmin.from('product_images').delete().eq('listing_id', listing.id);
      if (req.body.image_urls.length) {
        await supabaseAdmin.from('product_images').insert(req.body.image_urls.map((url, i) => ({ listing_id: listing.id, image_url: url, sort_order: i })));
      }
    }
    const { data: updated } = await supabaseAdmin.from('listings').select('*, products(id, name, unit)').eq('id', listing.id).single();
    return ok(res, updated);
  } catch (err) { next(err); }
}

// Soft delete: transaction-style history is never hard-deleted.
async function remove(req, res, next) {
  try {
    const farmer = await getFarmerByUser(req.user.id);
    if (!farmer) throw new AppError('Farmer profile required.', 403);
    const { data: listing } = await supabaseAdmin.from('listings').select('id, farmer_id, status').eq('id', req.params.id).single();
    if (!listing) throw new AppError('Listing not found.', 404);
    if (listing.farmer_id !== farmer.id) return fail(res, 'You can only deactivate your own listings.', 403);
    await supabaseAdmin.from('listings').update({ status: 'inactive' }).eq('id', listing.id);
    return ok(res, { id: listing.id, status: 'inactive' });
  } catch (err) { next(err); }
}

module.exports = { create, list, getById, update, remove };

