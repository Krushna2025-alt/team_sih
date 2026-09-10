const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');
const { validate } = require('../middleware/validate');
const { createDemandSchema, updateDemandSchema, demandMatchQuerySchema } = require('../validators/demandValidator');
const ctrl = require('../controllers/demandController');

router.use(authenticate);
router.post('/', requireRole('buyer'), validate(createDemandSchema), ctrl.create);
router.get('/', requireRole('buyer'), ctrl.listMine);
router.get('/matches', validate(demandMatchQuerySchema, 'query'), ctrl.matches);
router.patch('/:id', requireRole('buyer'), validate(updateDemandSchema), ctrl.update);

module.exports = router;

