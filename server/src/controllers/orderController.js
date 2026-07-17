const Order = require('../models/Order');
const Book = require('../models/Book');
const Inventory = require('../models/Inventory');

// @desc    Place a new order
// @route   POST /api/orders
// @access  Private
const placeOrder = async (req, res) => {
  const { items } = req.body; // Array of { bookId, quantity, format }
  
  if (!items || items.length === 0) {
    return res.status(400).json({ message: 'No items in order' });
  }

  try {
    let totalPrice = 0;
    const orderItems = [];

    // First pass: Verify inventory and calculate price
    for (const item of items) {
      const book = await Book.findById(item.bookId);
      if (!book) {
        return res.status(404).json({ message: `Book not found: ${item.bookId}` });
      }

      // Check stock if NOT an eBook format
      if (item.format !== 'ebook') {
        const inventoryRecords = await Inventory.find({ bookId: item.bookId });
        const availableStock = inventoryRecords.reduce((sum, inv) => sum + inv.quantity, 0);

        if (availableStock < item.quantity) {
          return res.status(400).json({
            message: `Insufficient stock for "${book.title}". Requested: ${item.quantity}, Available: ${availableStock}`
          });
        }
      }

      const itemPrice = book.price;
      totalPrice += itemPrice * item.quantity;

      orderItems.push({
        bookId: item.bookId,
        quantity: item.quantity,
        price: itemPrice,
        format: item.format || 'paperback',
      });
    }

    // Second pass: Deduct inventory (only for physical books) and process checkout
    for (const item of orderItems) {
      if (item.format !== 'ebook') {
        const inventoryRecords = await Inventory.find({ bookId: item.bookId });
        let remainingToDeduct = item.quantity;

        for (const record of inventoryRecords) {
          if (remainingToDeduct <= 0) break;
          if (record.quantity >= remainingToDeduct) {
            record.quantity -= remainingToDeduct;
            remainingToDeduct = 0;
            await record.save();
          } else {
            remainingToDeduct -= record.quantity;
            record.quantity = 0;
            await record.save();
          }
        }

        // Re-evaluate stock level to adjust book availability status
        const inventoryRecordsAfter = await Inventory.find({ bookId: item.bookId });
        const finalStock = inventoryRecordsAfter.reduce((sum, inv) => sum + inv.quantity, 0);
        if (finalStock <= 0) {
          await Book.findByIdAndUpdate(item.bookId, { availabilityStatus: 'out-of-stock' });
        }
      }
    }

    // Generate unique readable order ID
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const orderID = `BKST-${Date.now().toString().slice(-6)}-${randomSuffix}`;

    const order = await Order.create({
      userId: req.user._id,
      items: orderItems,
      totalPrice,
      orderID,
      status: 'pending',
    });

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id })
      .populate({
        path: 'items.bookId',
        select: 'title description price availabilityStatus'
      })
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get order details by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('userId', 'name email')
      .populate({
        path: 'items.bookId',
        select: 'title description price availabilityStatus'
      });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Authorization: User can view their own order; admin/seller can view all orders
    if (order.userId._id.toString() !== req.user._id.toString() && req.user.role !== 'admin' && req.user.role !== 'seller') {
      return res.status(403).json({ message: 'Not authorized to view this order' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  placeOrder,
  getMyOrders,
  getOrderById,
};
