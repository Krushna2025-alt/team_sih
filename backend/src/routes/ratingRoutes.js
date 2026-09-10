const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');
const { validate } = require('../middleware/validate');
const { ratingSchema } = require('../validators/ratingValidator');
const ctrl = require('../controllers/ratingController');

router.use(authenticate);
router.post('/', requireRole('farmer', 'buyer'), validate(ratingSchema), ctrl.create);

module.exports = router;

