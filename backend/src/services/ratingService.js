const { supabaseAdmin } = require('../config/supabase');
const AppError = require('../utils/appError');
const notificationService = require('./notificationService');

// Reliability from ratings + transaction history (Bayesian average, prior 3.0 with weight 2).
async function recomputeReliability(ratedUserId) {
  const { data: ratings } = await supabaseAdmin.from('ratings').select('rating').eq('rated_id', ratedUserId);
  const n = (ratings || []).length;
  if (n === 0) return;
  const sum = ratings.reduce((a, r) => a + r.rating, 0);
  const reliability = Math.round(((sum + 3 * 2) / (n + 2)) * 100) / 100;
  const { data: farmer } = await supabaseAdmin.from('farmers').select('id').eq('user_id', ratedUserId).single();
  if (farmer) await supabaseAdmin.from('farmers').update({ reliability_score: reliability }).eq('id', farmer.id);
  else await supabaseAdmin.from('buyers').update({ reliability_score: reliability }).eq('user_id', ratedUserId);
}

async function submitRating(userId, { order_id, rating, comment }) {
  const { data: order } = await supabaseAdmin
    .from('orders')
    .select('id, status, farmers(user_id), buyers(user_id)')
    .eq('id', order_id).single();
  if (!order) throw new AppError('Order not found.', 404);
  if (order.status !== 'delivered') throw new AppError('Rating allowed only after the order is delivered.', 409);

  let ratedUserId = null;
  if (order.buyers.user_id === userId) ratedUserId = order.farmers.user_id;      // buyer rates farmer
  else if (order.farmers.user_id === userId) ratedUserId = order.buyers.user_id; // farmer rates buyer
  else throw new AppError('You can only rate orders you are part of.', 403);
  if (ratedUserId === userId) throw new AppError('You cannot rate yourself.', 422);

  const { data: existing } = await supabaseAdmin
    .from('ratings').select('id').eq('order_id', order_id).eq('rater_id', userId).maybeSingle();
  if (existing) throw new AppError('You have already rated this order.', 409);

  const { data: inserted, error } = await supabaseAdmin
    .from('ratings')
    .insert({ order_id, rater_id: userId, rated_id: ratedUserId, rating, comment: comment || null })
    .select('*').single();
  if (error) throw error;

  await recomputeReliability(ratedUserId);
  await notificationService.create({ user_id: ratedUserId, type: 'system', title: 'New rating received', message: 'You received a ' + rating + '-star rating.' });
  return inserted;
}

module.exports = { submitRating };

