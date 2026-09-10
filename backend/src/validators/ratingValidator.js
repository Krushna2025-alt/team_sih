const { z } = require('zod');

const ratingSchema = z.object({
  order_id: z.string().uuid(),
  rating: z.number().int().min(1, 'rating must be between 1 and 5').max(5, 'rating must be between 1 and 5'),
  comment: z.string().max(500).optional(),
}).strict();

module.exports = { ratingSchema };

