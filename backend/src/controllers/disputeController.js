const { supabaseAdmin } = require('../config/supabase');
const { created } = require('../utils/response');
const AppError = require('../utils/appError');
const notificationService = require('../services/notificationService');

// POST /api/v1/disputes - buyer or farmer on their own order.
async function create(req, res, next) {
  try {
    const { data: order } = await supabaseAdmin.from('orders')
      .select('id, farmers(user_id), buyers(user_id)').eq('id', req.body.order_id).single();
    if (!order) throw new AppError('Order not found.', 404);
    if (order.farmers.user_id !== req.user.id && order.buyers.user_id !== req.user.id) {
      throw new AppError('You can only raise disputes on your own orders.', 403);
    }

    const { data: dispute, error } = await supabaseAdmin.from('disputes')
      .insert({ order_id: order.id, raised_by: req.user.id, reason: req.body.reason }).select('*').single();
    if (error) throw error;

    const otherUserId = order.farmers.user_id === req.user.id ? order.buyers.user_id : order.farmers.user_id;
    await notificationService.create({ user_id: otherUserId, type: 'system', title: 'Dispute raised', message: 'A dispute was raised on order ' + order.id.slice(0, 8) + '.' });
    return created(res, dispute);
  } catch (err) { next(err); }
}

module.exports = { create };

