const express = require('express');
const router = express.Router();
const {
  getCheckoutConfig,
  createPaymentIntent,
} = require('../controllers/checkoutController');
const { optionalAuth } = require('../middleware/authMiddleware');

router.get('/config', getCheckoutConfig);
router.post('/create-payment-intent', optionalAuth, createPaymentIntent);

module.exports = router;
