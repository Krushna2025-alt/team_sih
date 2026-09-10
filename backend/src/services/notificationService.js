const { supabaseAdmin } = require('../config/supabase');
const logger = require('../config/logger');

const TYPES = [
  'new_order', 'order_accepted', 'order_rejected', 'order_dispatched', 'order_delivered',
  'payment_update', 'matching_demand', 'bulk_offer', 'bulk_offer_accepted', 'bulk_offer_rejected', 'system',
];

// MVP = in-app notifications only. Email/SMS adapters can plug in later.
async function create({ user_id, type, title, message }) {
  if (!TYPES.includes(type)) type = 'system';
  const { error } = await supabaseAdmin.from('notifications').insert({ user_id, type, title, message });
  if (error) logger.error({ msg: error.message }, 'notification insert failed'); // never break the main flow
}

async function createMany(rows) {
  if (!rows?.length) return;
  const payload = rows.map((r) => ({ ...r, type: TYPES.includes(r.type) ? r.type : 'system' }));
  const { error } = await supabaseAdmin.from('notifications').insert(payload);
  if (error) logger.error({ msg: error.message }, 'notification batch insert failed');
}

module.exports = { create, createMany, TYPES };

