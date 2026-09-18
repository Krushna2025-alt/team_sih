const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');
const { validate } = require('../middleware/validate');
const { createBulkDealSchema, createBulkOfferSchema, updateBulkOfferSchema, bulkDealQuerySchema } = require('../validators/bulkDealValidator');
const ctrl = require('../controllers/bulkDealController');

router.post('/bulk-deals', authenticate, requireRole('farmer'), validate(createBulkDealSchema), ctrl.createDeal);
router.get('/bulk-deals', authenticate, validate(bulkDealQuerySchema, 'query'), ctrl.listDeals);
router.post('/bulk-deals/:id/offers', authenticate, requireRole('buyer'), validate(createBulkOfferSchema), ctrl.createOffer);
router.patch('/bulk-offers/:id', authenticate, validate(updateBulkOfferSchema), ctrl.updateOffer);

module.exports = router;

