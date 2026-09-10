const router = require('express').Router();
const ctrl = require('../controllers/productController');

router.get('/', ctrl.list); // public catalog

module.exports = router;

