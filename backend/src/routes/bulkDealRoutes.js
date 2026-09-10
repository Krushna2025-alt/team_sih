const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');
const { validate } = require('../middleware/validate');
const { createBulkDealSchema, createBulkOfferSchema, updateBulkOfferSchema, bulkDealQuerySchema } = require('../validators/bulkDealValidator');
const ctrl = require('../controllers/bulkDealController');

router.use(authenticate);
router.post('/bulk-deals', requireRole('farmer'), validate(createBulkDealSchema), ctrl.createDeal);
router.get('/bulk-deals', validate(bulkDealQuerySchema, 'query'), ctrl.listDeals);
router.post('/bulk-deals/:id/offers', requireRole('buyer'), validate(createBulkOfferSchema), ctrl.createOffer);
router.patch('/bulk-offers/:id', validate(updateBulkOfferSchema), ctrl.updateOffer);

module.exports = router;

