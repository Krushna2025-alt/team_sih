const express = require('express');
const router = express.Router();
const verificationController = require('../controllers/verificationController');

// POST /api/v1/verifications
router.post('/', verificationController.createVerification);

// GET /api/v1/verifications/:id
router.get('/:id', verificationController.getVerification);

module.exports = router;
