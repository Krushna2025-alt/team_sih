import { supabase } from './supabaseClient';
import { getSessionUser } from './authService';
import type { DeliveryType, Dispute, Order, OrderStatus } from '../types';

export const getOrders = async (role: 'farmer' | 'buyer'): Promise<Order[]> => {
  if (!supabase) return [];

  try {
    const user = await getSessionUser();
    if (!user) return [];

    const column = role === 'farmer' ? 'farmer_id' : 'buyer_id';
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq(column, user.id)
      .order('created_at', { ascending: false });

    if (error || !data) {
      return [];
    }

    return data.map((row: any): Order => ({
      id: row.id,
      role: role,
      counterpartyName: role === 'farmer' ? 'Buyer Order' : 'Farmer Order',
      items: [{
        id: row.id,
        productId: row.id,
        productName: row.product_name,
        quantityKg: Number(row.quantity_kg),
        pricePerKg: Number(row.price_per_kg),
      }],
      subtotal: Number(row.total_price),
      deliveryFee: 0,
      total: Number(row.total_price),
      status: row.status as OrderStatus,
      deliveryType: 'delivery',
      deliveryDate: new Date(row.created_at).toLocaleDateString(),
      address: 'Delivery Address',
      createdAt: row.created_at,
      negotiationPrice: row.negotiation_price ? Number(row.negotiation_price) : undefined,
      negotiationBy: row.negotiation_by || undefined,
    }));
  } catch (err) {
    console.error('getOrders error:', err);
    return [];
  }
};

export const getOrder = async (id: string): Promise<Order> => {
  if (!supabase) throw new Error('Database not connected');
  const { data, error } = await supabase.from('orders').select('*').eq('id', id).single();
  if (error || !data) throw new Error('Order not found');

  return {
    id: data.id,
    counterpartyName: 'Customer',
    items: [{
      id: data.id,
      productId: data.id,
      productName: data.product_name,
      quantityKg: Number(data.quantity_kg),
      pricePerKg: Number(data.price_per_kg),
    }],
    subtotal: Number(data.total_price),
    deliveryFee: 0,
    total: Number(data.total_price),
    status: data.status as OrderStatus,
    deliveryType: 'delivery',
    deliveryDate: new Date(data.created_at).toLocaleDateString(),
    address: 'Delivery Address',
    createdAt: data.created_at,
    negotiationPrice: data.negotiation_price ? Number(data.negotiation_price) : undefined,
    negotiationBy: data.negotiation_by || undefined,
  };
};

export interface CreateOrderPayload {
  items: { listingId: string; quantityKg: number }[];
  deliveryType: DeliveryType;
  deliveryDate: string;
  address: string;
  paymentMethod: string;
}

export const createOrder = async (body: CreateOrderPayload): Promise<Order> => {
  if (!supabase) throw new Error('Database not connected');

  const user = await getSessionUser();
  if (!user) throw new Error('User not authenticated');

  const firstItem = body.items[0];
  const { data: listing } = await supabase.from('farmer_listings').select('*').eq('id', firstItem.listingId).maybeSingle();

  const insertData = {
    farmer_id: listing ? listing.farmer_id : user.id,
    buyer_id: user.id,
    product_name: listing ? listing.product : 'Produce',
    quantity_kg: firstItem.quantityKg,
    price_per_kg: listing ? listing.price_per_kg : 30,
    total_price: (listing ? listing.price_per_kg : 30) * firstItem.quantityKg,
    status: 'pending',
  };

  const { data, error } = await supabase.from('orders').insert([insertData]).select().single();
  if (error || !data) throw new Error(error?.message || 'Failed to create order');

  return {
    id: data.id,
    counterpartyName: listing?.farmer_name || 'Farmer',
    items: [{
      id: data.id,
      productId: firstItem.listingId,
      productName: data.product_name,
      quantityKg: data.quantity_kg,
      pricePerKg: data.price_per_kg,
    }],
    subtotal: data.total_price,
    deliveryFee: 0,
    total: data.total_price,
    status: 'pending',
    deliveryType: body.deliveryType,
    deliveryDate: body.deliveryDate,
    address: body.address,
    createdAt: data.created_at,
  };
};

export const updateOrderStatus = async (id: string, status: OrderStatus): Promise<Order> => {
  if (!supabase) throw new Error('Database not connected');

  const { error } = await supabase
    .from('orders')
    .update({ status, negotiation_status: 'none' })
    .eq('id', id);

  if (error) throw new Error(error.message);
  return getOrder(id);
};

export const negotiateOrder = async (id: string, negotiationPrice: number, negotiationBy: 'farmer' | 'buyer'): Promise<Order> => {
  if (!supabase) throw new Error('Database not connected');

  const { error } = await supabase
    .from('orders')
    .update({
      status: 'negotiating',
      negotiation_status: 'negotiating',
      negotiation_price: negotiationPrice,
      negotiation_by: negotiationBy,
    })
    .eq('id', id);

  if (error) throw new Error(error.message);
  return getOrder(id);
};

export const createDispute = async (body: { orderId: string; reason: string }): Promise<Dispute> => {
  if (supabase) {
    const user = await getSessionUser();
    const { data } = await supabase
      .from('disputes')
      .insert([{
        order_id: body.orderId,
        raised_by: user?.id || 'unknown',
        reason: body.reason,
        status: 'open',
      }])
      .select()
      .maybeSingle();

    if (data) {
      return {
        id: data.id,
        orderId: data.order_id,
        raisedBy: data.raised_by,
        against: 'Platform',
        reason: data.reason,
        status: 'open',
        createdAt: data.created_at,
      };
    }
  }

  return {
    id: `disp-${Date.now()}`,
    orderId: body.orderId,
    raisedBy: 'user',
    against: 'farmer',
    reason: body.reason,
    status: 'open',
    createdAt: new Date().toISOString(),
  };
};
