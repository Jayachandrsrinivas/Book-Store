const Book = require('../models/Book');
const Order = require('../models/Order');
const Inventory = require('../models/Inventory');

// @desc    Get dashboard statistics for a seller
// @route   GET /api/seller/dashboard
// @access  Private (Seller)
const getSellerDashboard = async (req, res) => {
  try {
    const sellerId = req.user._id;

    // 1. Get seller's books
    const books = await Book.find({ sellerId });
    const bookIds = books.map(book => book._id);

    // 2. Calculate total inventory stock
    const inventories = await Inventory.find({ bookId: { $in: bookIds } });
    const totalStock = inventories.reduce((sum, inv) => sum + inv.quantity, 0);

    // 3. Find orders containing seller's books
    const orders = await Order.find({ 'items.bookId': { $in: bookIds } })
      .populate('userId', 'name email');

    // 4. Calculate total revenue and total sales count from seller's items specifically
    let totalRevenue = 0;
    let itemsSold = 0;

    orders.forEach(order => {
      order.items.forEach(item => {
        if (bookIds.some(bid => bid.toString() === item.bookId.toString())) {
          totalRevenue += item.price * item.quantity;
          itemsSold += item.quantity;
        }
      });
    });

    res.json({
      bookCount: books.length,
      totalStock,
      orderCount: orders.length,
      totalRevenue,
      itemsSold,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all orders containing seller's books
// @route   GET /api/seller/orders
// @access  Private (Seller)
const getSellerOrders = async (req, res) => {
  try {
    const sellerId = req.user._id;
    const books = await Book.find({ sellerId });
    const bookIds = books.map(b => b._id);

    const orders = await Order.find({ 'items.bookId': { $in: bookIds } })
      .populate('userId', 'name email')
      .populate({
        path: 'items.bookId',
        select: 'title price'
      })
      .sort({ createdAt: -1 });

    // Filter order items to only show seller's products to protect other sellers' data
    const sellerFilteredOrders = orders.map(order => {
      const orderObj = order.toObject();
      orderObj.items = orderObj.items.filter(item => 
        bookIds.some(bid => bid.toString() === item.bookId._id.toString())
      );
      return orderObj;
    });

    res.json(sellerFilteredOrders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update order status
// @route   PUT /api/seller/orders/:id/status
// @access  Private (Seller/Admin)
const updateOrderStatus = async (req, res) => {
  const { status } = req.body;
  if (!['pending', 'shipped', 'delivered', 'cancelled'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status value' });
  }

  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Verify ownership of at least one book in this order if seller
    if (req.user.role === 'seller') {
      const books = await Book.find({ sellerId: req.user._id });
      const bookIds = books.map(b => b._id.toString());
      const hasSellerBook = order.items.some(item => bookIds.includes(item.bookId.toString()));

      if (!hasSellerBook) {
        return res.status(403).json({ message: 'Not authorized to modify this order' });
      }
    }

    order.status = status;
    await order.save();
    res.json({ message: `Order status updated to ${status}`, order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getSellerDashboard,
  getSellerOrders,
  updateOrderStatus,
};
