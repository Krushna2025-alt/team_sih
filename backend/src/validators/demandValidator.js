const { z } = require('zod');

const createDemandSchema = z.object({
  product_id: z.string().uuid(),
  quantity_kg: z.number().positive('quantity_kg must be > 0'),
  min_price: z.number().min(0).optional(),
  max_price: z.number().min(0).optional(),
  required_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  delivery_address: z.string().min(5).max(300),
  notes: z.string().max(500).optional(),
}).strict().refine((d) => d.min_price == null || d.max_price == null || d.max_price >= d.min_price, {
  message: 'max_price must be >= min_price', path: ['max_price'],
});

const updateDemandSchema = z.object({
  quantity_kg: z.number().positive().optional(),
  min_price: z.number().min(0).nullable().optional(),
  max_price: z.number().min(0).nullable().optional(),
  required_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  delivery_address: z.string().min(5).max(300).optional(),
  notes: z.string().max(500).nullable().optional(),
  status: z.enum(['open', 'closed']).optional(),
}).strict().refine((o) => Object.keys(o).length > 0, { message: 'At least one field is required' });

const demandMatchQuerySchema = z.object({ demand_id: z.string().uuid().optional() });

module.exports = { createDemandSchema, updateDemandSchema, demandMatchQuerySchema };

