const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { profileSchema } = require('../validators/authValidator');
const ctrl = require('../controllers/authController');

router.post('/profile', authenticate, validate(profileSchema), ctrl.upsertProfile);
router.get('/profile', authenticate, ctrl.getProfile);

module.exports = router;

