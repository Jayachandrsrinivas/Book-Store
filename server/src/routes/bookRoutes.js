const express = require('express');
const router = express.Router();
const {
  getBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  interactWithBook,
  getBookReviews,
} = require('../controllers/bookController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
  .get(getBooks)
  .post(protect, authorize('seller', 'admin'), createBook);

router.route('/:id')
  .get(getBookById)
  .put(protect, authorize('seller', 'admin'), updateBook)
  .delete(protect, authorize('seller', 'admin'), deleteBook);

router.post('/:id/interact', protect, interactWithBook);
router.get('/:id/reviews', getBookReviews);

module.exports = router;
