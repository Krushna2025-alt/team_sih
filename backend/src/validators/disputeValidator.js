const { z } = require('zod');

const disputeSchema = z.object({
  order_id: z.string().uuid(),
  reason: z.string().min(10, 'Please describe the issue (min 10 chars)').max(1000),
}).strict();

const resolveDisputeSchema = z.object({
  resolution: z.string().min(5).max(1000),
  status: z.enum(['resolved', 'rejected']).default('resolved'),
}).strict();

module.exports = { disputeSchema, resolveDisputeSchema };

