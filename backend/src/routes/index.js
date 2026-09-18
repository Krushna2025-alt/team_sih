const router = require('express').Router();

router.use('/auth', require('./authRoutes'));
router.use('/products', require('./productRoutes'));
router.use('/listings', require('./listingRoutes'));
router.use('/voice', require('./voiceRoutes'));
router.use('/demands', require('./demandRoutes'));
router.use('/orders', require('./orderRoutes'));
router.use(require('./bulkDealRoutes')); // defines /bulk-deals and /bulk-offers
router.use('/ratings', require('./ratingRoutes'));
router.use('/dashboard', require('./dashboardRoutes'));
router.use('/admin', require('./adminRoutes'));
router.use('/notifications', require('./notificationRoutes'));
router.use('/disputes', require('./disputeRoutes'));
router.use('/verifications', require('./verificationRoutes'));

module.exports = router;

