const { supabaseAdmin } = require('../config/supabase');
const { ok, fail, created } = require('../utils/response');
const AppError = require('../utils/appError');

const getFullProfile = async (userId) => {
  const { data: user } = await supabaseAdmin.from('users').select('*').eq('id', userId).single();
  if (!user) return null;
  const { data: farmer } = await supabaseAdmin.from('farmers').select('*').eq('user_id', userId).maybeSingle();
  const { data: buyer } = await supabaseAdmin.from('buyers').select('*').eq('user_id', userId).maybeSingle();
  return { user, farmer, buyer };
};

// POST /api/v1/auth/profile - creates or updates the application profile (after Supabase signup).
async function upsertProfile(req, res, next) {
  try {
    const body = req.body;
    const userId = req.user.id;

    const { data: existing } = await supabaseAdmin.from('users').select('*').eq('id', userId).maybeSingle();
    if (existing && existing.role !== body.role) {
      return fail(res, 'Role cannot be changed after profile creation.', 409);
    }

    const userPayload = {
      id: userId,
      email: req.authUser.email || null,
      phone: req.authUser.phone || null,
      role: body.role,
      language_preference: body.language_preference || existing?.language_preference || 'en',
    };
    const { error: userErr } = await supabaseAdmin.from('users').upsert(userPayload, { onConflict: 'id' });
    if (userErr) throw userErr;

    if (body.role === 'farmer') {
      const { error } = await supabaseAdmin.from('farmers').upsert({ user_id: userId, ...body.farmer }, { onConflict: 'user_id' });
      if (error) throw error;
      await supabaseAdmin.from('audit_logs').insert({ actor_id: userId, action: 'profile_created', entity_type: 'farmer', entity_id: userId, metadata: { farm_name: body.farmer.farm_name } });
    } else {
      const { error } = await supabaseAdmin.from('buyers').upsert({ user_id: userId, ...body.buyer }, { onConflict: 'user_id' });
      if (error) throw error;
      await supabaseAdmin.from('audit_logs').insert({ actor_id: userId, action: 'profile_created', entity_type: 'buyer', entity_id: userId, metadata: { institution_name: body.buyer.institution_name } });
    }

    const profile = await getFullProfile(userId);
    return existing ? ok(res, profile) : created(res, profile);
  } catch (err) { next(err); }
}

// GET /api/v1/auth/profile - convenience for the frontend after login.
async function getProfile(req, res, next) {
  try {
    const profile = await getFullProfile(req.user.id);
    if (!profile) throw new AppError('Profile not found. Create it first.', 404);
    return ok(res, profile);
  } catch (err) { next(err); }
}

module.exports = { upsertProfile, getProfile };

