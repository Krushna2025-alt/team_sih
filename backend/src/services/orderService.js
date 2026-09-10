const { supabaseAdmin } = require('../config/supabase');
const env = require('../config/env');
const AppError = require('../utils/appError');
const { todayISO } = require('../utils/distance');
const notificationService = require('./notificationService');
const { getBuyerByUser, getFarmerByUser } = require('./profileService');
const { paginationMeta } = require('../utils/pagination');

// Role-based allowed transitions. Backend rejects anything else (e.g. pending -> delivered).
const ORDER_TRANSITIONS = {
  farmer: { pending: ['confirmed', 'rejected'], confirmed: ['dispatched'] },
  buyer: { pending: ['cancelled'], dispatched: ['delivered'] },
  admin: { pending: ['confirmed', 'rejected', 'cancelled'], confirmed: ['dispatched', 'cancelled'], dispatched: ['delivered', 'cancelled'] },
};

const ORDER_SELECT = '*, order_items(*, products(name, unit)), deliveries(delivery_address, status, estimated_delivery, actual_delivery), farmers!inner(user_id, farm_name), buyers!inner(user_id, institution_name)';

function mapOrderError(error) {
  const msg = error.message || '';
  if (msg.includes('LISTING_NOT_FOUND')) return new AppError('One or more listings were not found.', 404);
  if (msg.includes('LISTING_INACTIVE')) return new AppError('One or more listings are no longer active.', 409);
  if (msg.includes('INSUFFICIENT_QUANTITY')) return new AppError('Requested quantity exceeds available stock.', 409);
  if (msg.includes('INVALID_QUANTITY')) return new AppError('Order quantity must be greater than zero.', 422);
  if (msg.includes('MULTIPLE_FARMERS')) return new AppError('An order can only contain items from one farmer.', 422);
  return new AppError('Could not create order. Please try again.', 500);
}

// CRITICAL operation. Pricing/totals/inventory computed server-side inside fn_create_order (DB transaction; rolls back on failure).
async function createOrder(buyerUserId, { items, delivery_address }) {
  const buyer = await getBuyerByUser(buyerUserId);
  if (!buyer) throw new AppError('Buyer profile required.', 403);

  // Pre-validate for clear errors before the transaction.
  const { data: listings } = await supabaseAdmin
    .from('listings')
    .select('id, farmer_id, quantity_kg, price_per_kg, status, availability_date')
    .in('id', items.map((i) => i.listing_id));
  const byId = new Map((listings || []).map((l) => [l.id, l]));
  for (const it of items) {
    const l = byId.get(it.listing_id);
    if (!l) throw new AppError('Listing ' + it.listing_id + ' not found.', 404);
    if (l.status !== 'active') throw new AppError('Listing ' + it.listing_id + ' is not active.', 409);
    if (l.availability_date < todayISO()) throw new AppError('Listing ' + it.listing_id + ' has expired.', 409);
    if (Number(l.quantity_kg) < it.quantity_kg) throw new AppError('Only ' + l.quantity_kg + ' kg left for listing ' + it.listing_id + '.', 409);
  }

  const { data, error } = await supabaseAdmin.rpc('fn_create_order', {
    p_buyer_id: buyer.id,
    p_delivery_address: delivery_address || buyer.location || null,
    p_items: items,
  });
  if (error) throw mapOrderError(error);

  // MVP mock payment mode (non-production): mark paid immediately.
  if (!env.isProduction) {
    await supabaseAdmin.from('payments').update({ status: 'paid', gateway_reference: 'MOCK-' + data.order_id }).eq('order_id', data.order_id);
    await supabaseAdmin.from('orders').update({ payment_status: 'paid' }).eq('id', data.order_id);
  }

  const { data: farmer } = await supabaseAdmin.from('farmers').select('user_id').eq('id', data.farmer_id).single();
  await notificationService.create({ user_id: farmer.user_id, type: 'new_order', title: 'New order received', message: 'You have a new order worth Rs.' + data.total_amount + '.' });
  if (!env.isProduction) {
    await notificationService.create({ user_id: buyer.user_id, type: 'payment_update', title: 'Payment recorded', message: 'Payment marked paid (mock mode).' });
  }
  return getOrderById(data.order_id, { id: buyerUserId, role: 'buyer' });
}

async function getOrderById(orderId, user) {
  const { data: order, error } = await supabaseAdmin.from('orders').select(ORDER_SELECT).eq('id', orderId).single();
  if (error || !order) throw new AppError('Order not found.', 404);
  if (user.role !== 'admin' && order.farmers.user_id !== user.id && order.buyers.user_id !== user.id) {
    throw new AppError('You are not part of this order.', 403);
  }
  return order;
}

async function listOrders(user, filters = {}) {
  const page = Math.max(parseInt(filters.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(filters.limit, 10) || 20, 1), 100);

  let query = supabaseAdmin.from('orders').select(ORDER_SELECT, { count: 'exact' });
  if (user.role === 'farmer') {
    const f = await getFarmerByUser(user.id);
    query = query.eq('farmer_id', f?.id || '00000000-0000-0000-0000-000000000000');
  } else if (user.role === 'buyer') {
    const b = await getBuyerByUser(user.id);
    query = query.eq('buyer_id', b?.id || '00000000-0000-0000-0000-000000000000');
  }
  if (filters.status) query = query.eq('status', filters.status);
  if (filters.payment_status) query = query.eq('payment_status', filters.payment_status);

  const { data, count, error } = await query
    .order('created_at', { ascending: false })
    .range((page - 1) * limit, page * limit - 1);
  if (error) throw error;
  return { data: data || [], pagination: paginationMeta(count || 0, page, limit) };
}

async function updateStatus(orderId, user, nextStatus) {
  const { data: order } = await supabaseAdmin.from('orders')
    .select('id, status, farmer_id, buyer_id, farmers(user_id), buyers(user_id)')
    .eq('id', orderId).single();
  if (!order) throw new AppError('Order not found.', 404);

  let actor = 'admin';
  if (user.role !== 'admin') {
    if (order.farmers.user_id === user.id) actor = 'farmer';
    else if (order.buyers.user_id === user.id) actor = 'buyer';
    else throw new AppError('You are not part of this order.', 403);
  }

  const allowed = (ORDER_TRANSITIONS[actor] || {})[order.status] || [];
  if (!allowed.includes(nextStatus)) {
    throw new AppError('Invalid status transition: ' + order.status + ' -> ' + nextStatus + ' for role ' + actor + '.', 409);
  }

  const { error } = await supabaseAdmin.from('orders').update({ status: nextStatus }).eq('id', orderId);
  if (error) throw error;

  if (nextStatus === 'rejected' || nextStatus === 'cancelled') {
    await supabaseAdmin.rpc('fn_restock_order', { p_order_id: orderId });
  }
  if (nextStatus === 'dispatched') {
    await supabaseAdmin.from('deliveries').update({ status: 'dispatched' }).eq('order_id', orderId);
  }
  if (nextStatus === 'delivered') {
    await supabaseAdmin.from('deliveries').update({ status: 'delivered', actual_delivery: new Date().toISOString() }).eq('order_id', orderId);
  }

  const notifyMap = {
    confirmed: ['order_accepted', 'buyer'], rejected: ['order_rejected', 'buyer'],
    dispatched: ['order_dispatched', 'buyer'], delivered: ['order_delivered', 'farmer'],
    cancelled: ['system', actor === 'farmer' ? 'buyer' : 'farmer'],
  };
  const [type, target] = notifyMap[nextStatus] || [];
  if (type) {
    const targetUserId = target === 'buyer' ? order.buyers.user_id : order.farmers.user_id;
    await notificationService.create({ user_id: targetUserId, type, title: 'Order ' + nextStatus, message: 'Order ' + orderId.slice(0, 8) + ' is now ' + nextStatus + '.' });
  }
  return getOrderById(orderId, user);
}

module.exports = { createOrder, listOrders, updateStatus, getOrderById };

