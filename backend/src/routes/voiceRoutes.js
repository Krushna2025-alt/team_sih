const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');
const { validate } = require('../middleware/validate');
const { voiceSchema } = require('../validators/voiceValidator');
const ctrl = require('../controllers/voiceController');

const voiceLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: true, legacyHeaders: false });

router.use(authenticate);
router.post('/extract-listing', requireRole('farmer'), voiceLimiter, validate(voiceSchema), ctrl.extract);

module.exports = router;

