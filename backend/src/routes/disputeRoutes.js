const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');
const { validate } = require('../middleware/validate');
const { disputeSchema } = require('../validators/disputeValidator');
const ctrl = require('../controllers/disputeController');

router.use(authenticate);
router.post('/', requireRole('farmer', 'buyer'), validate(disputeSchema), ctrl.create);

module.exports = router;

