const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  getBooks,
  getBookById,
  placeOrder,
  getMyOrders
} = require('../controllers/UsersController');

router.post('/register', registerUser);
router.post('/login', loginUser);

// Public routes
router.get('/books', getBooks);
router.get('/books/:id', getBookById);

// Protected routes
router.get('/profile', protect(['user']), getUserProfile);
router.put('/profile', protect(['user']), updateUserProfile);
router.post('/orders', protect(['user']), placeOrder);
router.get('/orders', protect(['user']), getMyOrders);

module.exports = router;
