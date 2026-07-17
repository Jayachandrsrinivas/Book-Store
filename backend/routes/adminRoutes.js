const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const {
  registerAdmin,
  loginAdmin,
  getDashboardStats,
  listUsers,
  editUser,
  deleteUser,
  listSellers,
  approveSeller,
  deleteSeller,
  getUserOrders,
  deleteOrder
} = require('../controllers/AdminControllers');

router.post('/register', registerAdmin);
router.post('/login', loginAdmin);

// Protected routes
router.get('/stats', protect(['admin']), getDashboardStats);
router.get('/users', protect(['admin']), listUsers);
router.put('/users/:id', protect(['admin']), editUser);
router.delete('/users/:id', protect(['admin']), deleteUser);
router.get('/sellers', protect(['admin']), listSellers);
router.put('/sellers/approve/:id', protect(['admin']), approveSeller);
router.delete('/sellers/:id', protect(['admin']), deleteSeller);
router.get('/user-orders/:userId', protect(['admin']), getUserOrders);
router.delete('/orders/:id', protect(['admin']), deleteOrder);

module.exports = router;
