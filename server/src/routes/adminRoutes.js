const express = require('express');
const router = express.Router();
const {
  getAdminDashboard,
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  getAllReviews,
  deleteReview,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/dashboard', protect, authorize('admin'), getAdminDashboard);

router.route('/users')
  .get(protect, authorize('admin'), getUsers)
  .post(protect, authorize('admin'), createUser);

router.route('/users/:id')
  .put(protect, authorize('admin'), updateUser)
  .delete(protect, authorize('admin'), deleteUser);

router.route('/reviews')
  .get(protect, authorize('admin'), getAllReviews);

router.route('/reviews/:id')
  .delete(protect, authorize('admin'), deleteReview);

module.exports = router;
