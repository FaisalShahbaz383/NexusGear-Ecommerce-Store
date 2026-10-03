const express = require('express');
const router = express.Router();
const {
  addOrderItems,
  getOrderById,
  getMyOrders,
  getOrders,
  updateOrderFulfillmentStatus,
  getDashboardMetrics,
} = require('../controllers/orderController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, addOrderItems)
  .get(protect, admin, getOrders);

router.get('/myorders', protect, getMyOrders);
router.get('/metrics', protect, admin, getDashboardMetrics);
router.get('/:id', protect, getOrderById);
router.put('/:id/status', protect, admin, updateOrderFulfillmentStatus);

module.exports = router;
