const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');
const { validate } = require('../middleware/validate');
const { createOrderSchema, orderStatusSchema, orderQuerySchema } = require('../validators/orderValidator');
const ctrl = require('../controllers/orderController');

router.use(authenticate);
router.post('/', requireRole('buyer'), validate(createOrderSchema), ctrl.create);
router.get('/', validate(orderQuerySchema, 'query'), ctrl.list);
router.patch('/:id/status', validate(orderStatusSchema), ctrl.updateStatus);

module.exports = router;

