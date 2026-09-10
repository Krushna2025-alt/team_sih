const { supabaseAdmin } = require('../config/supabase');
const { ok, fail } = require('../utils/response');
const AppError = require('../utils/appError');
const { parsePagination, paginationMeta } = require('../utils/pagination');

const audit = async (actorId, action, entityType, entityId, metadata = {}) => {
  await supabaseAdmin.from('audit_logs').insert({ actor_id: actorId, action, entity_type: entityType, entity_id: entityId, metadata });
};

// GET /api/v1/admin/analytics
async function analytics(req, res, next) {
  try {
    const count = async (table, filters = {}) => {
      let q = supabaseAdmin.from(table).select('*', { count: 'exact', head: true });
      for (const [k, v] of Object.entries(filters)) q = q.eq(k, v);
      return (await q).count || 0;
    };
    const byStatus = async (table, col, statuses) => {
      const out = {};
      for (const s of statuses) out[s] = await count(table, { [col]: s });
      return out;
    };
    const { data: orderTotals } = await supabaseAdmin.from('orders').select('total_amount');
    const gmv = (orderTotals || []).reduce((a, o) => a + Number(o.total_amount), 0);

    return ok(res, {
      users: { total: await count('users'), farmers: await count('users', { role: 'farmer' }), buyers: await count('users', { role: 'buyer' }) },
      farmers_verified: await count('farmers', { verified: true }),
      buyers_verified: await count('buyers', { verified: true }),
      listings: await byStatus('listings', 'status', ['active', 'inactive', 'sold_out', 'expired']),
      orders: await byStatus('orders', 'status', ['pending', 'confirmed', 'dispatched', 'delivered', 'rejected', 'cancelled']),
      gmv: Math.round(gmv * 100) / 100,
      disputes: await byStatus('disputes', 'status', ['open', 'resolved', 'rejected']),
    });
  } catch (err) { next(err); }
}

// GET /api/v1/admin/users
async function listUsers(req, res, next) {
  try {
    const { page, limit, offset } = parsePagination(req.validatedQuery || {});
    const { data, count, error } = await supabaseAdmin.from('users')
      .select('*, farmers(*), buyers(*)', { count: 'exact' })
      .order('created_at', { ascending: false }).range(offset, offset + limit - 1);
    if (error) throw error;
    return ok(res, data || [], 200, paginationMeta(count || 0, page, limit));
  } catch (err) { next(err); }
}

// PATCH /api/v1/admin/users/:id/verify
async function verifyUser(req, res, next) {
  try {
    const verified = req.body.verified;
    const { data: target } = await supabaseAdmin.from('users').select('id, role').eq('id', req.params.id).single();
    if (!target) throw new AppError('User not found.', 404);
    if (target.role === 'admin') return fail(res, 'Cannot verify admin accounts.', 400);

    const table = target.role === 'farmer' ? 'farmers' : 'buyers';
    const { data: updated, error } = await supabaseAdmin.from(table).update({ verified }).eq('user_id', target.id).select('*').single();
    if (error || !updated) throw error || new AppError('User has no ' + target.role + ' profile.', 404);

    await audit(req.user.id, verified ? 'verify_user' : 'unverify_user', target.role, target.id);
    return ok(res, { user_id: target.id, role: target.role, verified });
  } catch (err) { next(err); }
}

// GET /api/v1/admin/listings
async function listListings(req, res, next) {
  try {
    const { page, limit, offset } = parsePagination(req.validatedQuery || {});
    let q = supabaseAdmin.from('listings').select('*, products(name), farmers(farm_name)', { count: 'exact' });
    if (req.validatedQuery?.status) q = q.eq('status', req.validatedQuery.status);
    const { data, count, error } = await q.order('created_at', { ascending: false }).range(offset, offset + limit - 1);
    if (error) throw error;
    return ok(res, data || [], 200, paginationMeta(count || 0, page, limit));
  } catch (err) { next(err); }
}

// PATCH /api/v1/admin/listings/:id/status - moderate listings
async function moderateListing(req, res, next) {
  try {
    const { data: updated, error } = await supabaseAdmin.from('listings')
      .update({ status: req.body.status }).eq('id', req.params.id).select('id, status').single();
    if (error || !updated) throw error || new AppError('Listing not found.', 404);
    await audit(req.user.id, 'moderate_listing', 'listing', updated.id, { status: updated.status });
    return ok(res, updated);
  } catch (err) { next(err); }
}

// GET /api/v1/admin/orders
async function listOrders(req, res, next) {
  try {
    const { page, limit, offset } = parsePagination(req.validatedQuery || {});
    const { data, count, error } = await supabaseAdmin.from('orders')
      .select('*, farmers(farm_name), buyers(institution_name)', { count: 'exact' })
      .order('created_at', { ascending: false }).range(offset, offset + limit - 1);
    if (error) throw error;
    return ok(res, data || [], 200, paginationMeta(count || 0, page, limit));
  } catch (err) { next(err); }
}

// GET /api/v1/admin/disputes
async function listDisputes(req, res, next) {
  try {
    const { page, limit, offset } = parsePagination(req.validatedQuery || {});
    const { data, count, error } = await supabaseAdmin.from('disputes')
      .select('*, orders(id, total_amount, status)', { count: 'exact' })
      .order('created_at', { ascending: false }).range(offset, offset + limit - 1);
    if (error) throw error;
    return ok(res, data || [], 200, paginationMeta(count || 0, page, limit));
  } catch (err) { next(err); }
}

// PATCH /api/v1/admin/disputes/:id/resolve
async function resolveDispute(req, res, next) {
  try {
    const { data: updated, error } = await supabaseAdmin.from('disputes')
      .update({ status: req.body.status, resolution: req.body.resolution, resolved_at: new Date().toISOString() })
      .eq('id', req.params.id).select('*').single();
    if (error || !updated) throw error || new AppError('Dispute not found.', 404);
    await audit(req.user.id, 'resolve_dispute', 'dispute', updated.id, { status: updated.status });
    return ok(res, updated);
  } catch (err) { next(err); }
}

module.exports = { analytics, listUsers, verifyUser, listListings, moderateListing, listOrders, listDisputes, resolveDispute };

