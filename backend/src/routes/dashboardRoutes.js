const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');
const ctrl = require('../controllers/dashboardController');

router.use(authenticate);
router.get('/farmer', requireRole('farmer'), ctrl.farmer);
router.get('/buyer', requireRole('buyer'), ctrl.buyer);

module.exports = router;

