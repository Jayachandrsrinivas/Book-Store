const User = require('../models/User');
const Book = require('../models/Book');
const Order = require('../models/Order');
const Interaction = require('../models/Interaction');

// @desc    Get dashboard statistics for admin
// @route   GET /api/admin/dashboard
// @access  Private (Admin)
const getAdminDashboard = async (req, res) => {
  try {
    const userCount = await User.countDocuments({ role: 'user' });
    const sellerCount = await User.countDocuments({ role: 'seller' });
    const bookCount = await Book.countDocuments();
    const orders = await Order.find();
    
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalPrice, 0);

    res.json({
      userCount,
      sellerCount,
      bookCount,
      orderCount: orders.length,
      totalRevenue,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all users & sellers
// @route   GET /api/admin/users
// @access  Private (Admin)
const getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a user/seller (Admin capability)
// @route   POST /api/admin/users
// @access  Private (Admin)
const createUser = async (req, res) => {
  const { name, email, password, role, businessName } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    if (role === 'seller' && !businessName) {
      return res.status(400).json({ message: 'Business name is required for seller accounts' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'user',
      businessName: role === 'seller' ? businessName : undefined,
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      businessName: user.businessName,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update any user/seller account
// @route   PUT /api/admin/users/:id
// @access  Private (Admin)
const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.role = req.body.role || user.role;
    if (req.body.password) {
      user.password = req.body.password;
    }
    if (user.role === 'seller') {
      user.businessName = req.body.businessName || user.businessName || 'Unnamed Business';
    } else {
      user.businessName = undefined;
    }

    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      businessName: updatedUser.businessName,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete any user/seller (Admin capability)
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Clean up dependencies if they are a seller
    if (user.role === 'seller') {
      const books = await Book.find({ sellerId: user._id });
      const bookIds = books.map(b => b._id);
      
      // Delete interactions, inventory, book models
      await Book.deleteMany({ sellerId: user._id });
      await Inventory.deleteMany({ bookId: { $in: bookIds } });
      await Interaction.deleteMany({ bookId: { $in: bookIds } });
    }

    // Clean up their orders and reviews if user
    await Order.deleteMany({ userId: user._id });
    await Interaction.deleteMany({ userId: user._id });

    await User.deleteOne({ _id: user._id });
    res.json({ message: 'User and all related records deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all reviews for moderation
// @route   GET /api/admin/reviews
// @access  Private (Admin)
const getAllReviews = async (req, res) => {
  try {
    const reviews = await Interaction.find({ rating: { $exists: true } })
      .populate('userId', 'name email')
      .populate('bookId', 'title')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete review (Admin capability)
// @route   DELETE /api/admin/reviews/:id
// @access  Private (Admin)
const deleteReview = async (req, res) => {
  try {
    const review = await Interaction.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    await Interaction.deleteOne({ _id: review._id });
    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAdminDashboard,
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  getAllReviews,
  deleteReview,
};
