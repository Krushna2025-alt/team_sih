const { z } = require('zod');

const location = {
  location: z.string().min(2).max(200),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
};

const profileSchema = z.object({
  role: z.enum(['farmer', 'buyer']),
  language_preference: z.enum(['en', 'hi', 'mr']).optional(),
  farmer: z.object({ farm_name: z.string().min(2).max(120), ...location }).optional(),
  buyer: z.object({
    institution_name: z.string().min(2).max(160),
    institution_type: z.enum(['hostel', 'restaurant', 'canteen', 'hotel', 'mess', 'other']).default('other'),
    ...location,
  }).optional(),
}).strict().superRefine((val, ctx) => {
  if (val.role === 'farmer' && !val.farmer) ctx.addIssue({ code: 'custom', message: 'farmer details are required', path: ['farmer'] });
  if (val.role === 'buyer' && !val.buyer) ctx.addIssue({ code: 'custom', message: 'buyer details are required', path: ['buyer'] });
  if (val.role === 'farmer' && val.buyer) ctx.addIssue({ code: 'custom', message: 'role mismatch', path: ['buyer'] });
  if (val.role === 'buyer' && val.farmer) ctx.addIssue({ code: 'custom', message: 'role mismatch', path: ['farmer'] });
});

module.exports = { profileSchema };

