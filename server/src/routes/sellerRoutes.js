const express = require('express');
const router = express.Router();
const {
  getSellerDashboard,
  getSellerOrders,
  updateOrderStatus,
} = require('../controllers/sellerController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/dashboard', protect, authorize('seller'), getSellerDashboard);
router.get('/orders', protect, authorize('seller'), getSellerOrders);
router.put('/orders/:id/status', protect, authorize('seller', 'admin'), updateOrderStatus);

module.exports = router;
