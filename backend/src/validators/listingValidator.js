const { z } = require('zod');

const createListingSchema = z.object({
  product_id: z.string().uuid(),
  quantity_kg: z.number().positive('quantity_kg must be > 0'),
  price_per_kg: z.number().min(0, 'price_per_kg must be >= 0'),
  quality_grade: z.enum(['A', 'B', 'C']),
  availability_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'availability_date must be YYYY-MM-DD'),
  delivery_option: z.enum(['farmer_delivery', 'buyer_pickup']),
  image_urls: z.array(z.string().url()).max(5).optional(),
}).strict();

const updateListingSchema = z.object({
  quantity_kg: z.number().positive().optional(),
  price_per_kg: z.number().min(0).optional(),
  quality_grade: z.enum(['A', 'B', 'C']).optional(),
  availability_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  delivery_option: z.enum(['farmer_delivery', 'buyer_pickup']).optional(),
  status: z.enum(['active', 'inactive']).optional(),
  image_urls: z.array(z.string().url()).max(5).optional(),
}).strict().refine((o) => Object.keys(o).length > 0, { message: 'At least one field is required' });

const listingQuerySchema = z.object({
  product: z.string().uuid().optional(),
  min_price: z.coerce.number().min(0).optional(),
  max_price: z.coerce.number().min(0).optional(),
  quality_grade: z.enum(['A', 'B', 'C']).optional(),
  distance: z.coerce.number().positive().max(500).optional(),
  latitude: z.coerce.number().min(-90).max(90).optional(),
  longitude: z.coerce.number().min(-180).max(180).optional(),
  availability_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  status: z.enum(['active', 'inactive', 'sold_out', 'expired']).optional(),
  mine: z.enum(['true', 'false']).optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  sort: z.enum(['distance', 'price', 'quality', 'newest']).optional(),
});

module.exports = { createListingSchema, updateListingSchema, listingQuerySchema };

