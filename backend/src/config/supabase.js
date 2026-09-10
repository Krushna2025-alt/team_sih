const { createClient } = require('@supabase/supabase-js');
const env = require('./env');

// Centralized clients. Never create a new connection per request.
// Service role bypasses RLS - stays server-side ONLY.
const supabaseAdmin = createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const supabaseAnon = createClient(env.supabaseUrl, env.supabaseAnonKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

module.exports = { supabaseAdmin, supabaseAnon };

