const { supabaseAdmin } = require('../config/supabase');
const { fail } = require('../utils/response');

// Read token -> validate -> identify -> load profile -> determine role -> attach.
async function authenticate(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return fail(res, 'Authentication required.', 401);

    const { data, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !data?.user) return fail(res, 'Invalid or expired token.', 401);

    let role = data.user.user_metadata?.role || null;
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('id, role')
      .eq('id', data.user.id)
      .maybeSingle();

    if (profile?.role) {
      role = profile.role;
    }

    // Role comes from the DB or verified metadata
    req.authUser = data.user; // supabase auth user (email, phone)
    req.user = { id: data.user.id, role: role, profile: profile || null };
    return next();
  } catch (err) {
    return next(err);
  }
}

module.exports = { authenticate };

