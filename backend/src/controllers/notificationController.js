const { supabaseAdmin } = require('../config/supabase');
const { ok } = require('../utils/response');
const AppError = require('../utils/appError');
const { parsePagination, paginationMeta } = require('../utils/pagination');

async function list(req, res, next) {
  try {
    const { page, limit, offset } = parsePagination(req.validatedQuery || {});
    let q = supabaseAdmin.from('notifications').select('*', { count: 'exact' }).eq('user_id', req.user.id);
    if (req.validatedQuery?.is_read != null) q = q.eq('is_read', req.validatedQuery.is_read === 'true');
    const { data, count, error } = await q.order('created_at', { ascending: false }).range(offset, offset + limit - 1);
    if (error) throw error;
    return ok(res, data || [], 200, paginationMeta(count || 0, page, limit));
  } catch (err) { next(err); }
}

async function markRead(req, res, next) {
  try {
    const { data, error } = await supabaseAdmin.from('notifications')
      .update({ is_read: true }).eq('id', req.params.id).eq('user_id', req.user.id).select('id, is_read').single();
    if (error || !data) throw error || new AppError('Notification not found.', 404);
    return ok(res, data);
  } catch (err) { next(err); }
}

async function markAllRead(req, res, next) {
  try {
    await supabaseAdmin.from('notifications').update({ is_read: true }).eq('user_id', req.user.id).eq('is_read', false);
    return ok(res, { marked: 'all' });
  } catch (err) { next(err); }
}

module.exports = { list, markRead, markAllRead };

