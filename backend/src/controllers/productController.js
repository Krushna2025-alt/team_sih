const { supabaseAdmin } = require('../config/supabase');
const { ok } = require('../utils/response');

// GET /api/v1/products - public catalog.
async function list(req, res, next) {
  try {
    let query = supabaseAdmin.from('products').select('*, categories(id, name, name_en, name_hi, name_mr)').order('name');
    if (req.query.category_id) query = query.eq('category_id', req.query.category_id);
    if (req.query.q) query = query.ilike('name', '%' + req.query.q + '%');
    const { data, error } = await query;
    if (error) throw error;
    return ok(res, data || []);
  } catch (err) { next(err); }
}

module.exports = { list };

