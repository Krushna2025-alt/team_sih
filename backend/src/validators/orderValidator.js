const { z } = require('zod');

const createOrderSchema = z.object({
  items: z.array(z.object({
    listing_id: z.string().uuid(),
    quantity_kg: z.number().positive('quantity_kg must be > 0'),
  })).min(1, 'At least one order item is required').max(20),
  delivery_address: z.string().min(5).max(300).optional(),
}).strict();

const orderStatusSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'dispatched', 'delivered', 'rejected', 'cancelled']),
}).strict();

const orderQuerySchema = z.object({
  status: z.enum(['pending', 'confirmed', 'dispatched', 'delivered', 'rejected', 'cancelled']).optional(),
  payment_status: z.enum(['pending', 'paid', 'failed']).optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
});

module.exports = { createOrderSchema, orderStatusSchema, orderQuerySchema };

