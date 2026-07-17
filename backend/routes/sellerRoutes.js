const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/upload');
const {
  registerSeller,
  loginSeller,
  getSellerStats,
  getMyBooks,
  addBook,
  updateBook,
  deleteBook,
  getSellerOrders,
  updateOrderStatus
} = require('../controllers/SellerControllers');

router.post('/register', registerSeller);
router.post('/login', loginSeller);

// Protected routes
router.get('/stats', protect(['seller']), getSellerStats);
router.get('/books', protect(['seller']), getMyBooks);
router.post('/books', protect(['seller']), upload.single('image'), addBook);
router.put('/books/:id', protect(['seller']), upload.single('image'), updateBook);
router.delete('/books/:id', protect(['seller']), deleteBook);
router.get('/orders', protect(['seller']), getSellerOrders);
router.put('/orders/:id/status', protect(['seller']), updateOrderStatus);

module.exports = router;
