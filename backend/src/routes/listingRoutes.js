const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');
const { validate } = require('../middleware/validate');
const { createListingSchema, updateListingSchema, listingQuerySchema } = require('../validators/listingValidator');
const ctrl = require('../controllers/listingController');

router.use(authenticate);
router.post('/', requireRole('farmer'), validate(createListingSchema), ctrl.create);
router.get('/', validate(listingQuerySchema, 'query'), ctrl.list);
router.get('/:id', ctrl.getById);
router.patch('/:id', requireRole('farmer'), validate(updateListingSchema), ctrl.update);
router.delete('/:id', requireRole('farmer'), ctrl.remove);

module.exports = router;

