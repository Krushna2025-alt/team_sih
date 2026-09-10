const { z } = require('zod');
const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');
const { validate } = require('../middleware/validate');
const { resolveDisputeSchema } = require('../validators/disputeValidator');
const ctrl = require('../controllers/adminController');

// Every admin endpoint is RBAC-enforced here, server-side. Never frontend-only.
router.use(authenticate, requireRole('admin'));

router.get('/analytics', ctrl.analytics);
router.get('/users', ctrl.listUsers);
router.patch('/users/:id/verify', validate(z.object({ verified: z.boolean() }).strict()), ctrl.verifyUser);
router.get('/listings', ctrl.listListings);
router.patch('/listings/:id/status', validate(z.object({ status: z.enum(['active', 'inactive', 'expired']) }).strict()), ctrl.moderateListing);
router.get('/orders', ctrl.listOrders);
router.get('/disputes', ctrl.listDisputes);
router.patch('/disputes/:id/resolve', validate(resolveDisputeSchema), ctrl.resolveDispute);

module.exports = router;

