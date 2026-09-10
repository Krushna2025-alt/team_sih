const { z } = require('zod');

const createBulkDealSchema = z.object({
  product_id: z.string().uuid(),
  quantity_kg: z.number().positive(),
  min_quantity_kg: z.number().min(50, 'bulk minimum quantity must be >= 50kg'),
  base_price: z.number().min(0),
  closes_at: z.string().datetime({ offset: true }).or(z.string().min(10)),
}).strict().refine((d) => d.min_quantity_kg <= d.quantity_kg, {
  message: 'min_quantity_kg cannot exceed quantity_kg', path: ['min_quantity_kg'],
});

const createBulkOfferSchema = z.object({
  offered_quantity: z.number().positive(),
  offered_price: z.number().min(0),
  delivery_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
}).strict();

const updateBulkOfferSchema = z.object({
  action: z.enum(['accept', 'reject', 'withdraw']),
}).strict();

const bulkDealQuerySchema = z.object({
  mine: z.enum(['true', 'false']).optional(),
  product_id: z.string().uuid().optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
});

module.exports = { createBulkDealSchema, createBulkOfferSchema, updateBulkOfferSchema, bulkDealQuerySchema };

