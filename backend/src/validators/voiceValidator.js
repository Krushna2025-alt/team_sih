const { z } = require('zod');

const voiceSchema = z.object({
  transcript: z.string().min(1).max(1000).optional(),
  audio_base64: z.string().min(1).max(8000000).optional(),
  language: z.enum(['en', 'hi', 'mr']).optional(),
}).strict().refine((d) => d.transcript || d.audio_base64, {
  message: 'Provide transcript or audio_base64',
});

module.exports = { voiceSchema };

