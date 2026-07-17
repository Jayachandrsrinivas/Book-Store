const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin/AdminSchema');
const Seller = require('../models/Seller/SellerSchema');
const User = require('../models/Users/UserSchema');
const Book = require('../models/Users/BookSchema');
const Order = require('../models/Users/MyOrderSchema');

// Register Admin
const registerAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please enter all fields' });
    }

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: 'Admin already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newAdmin = new Admin({
      name,
      email,
      password: hashedPassword
    });

    const savedAdmin = await newAdmin.save();
    // Auto-update userId pointer to match MongoDB _id for consistency
    savedAdmin.userId = savedAdmin._id;
    await savedAdmin.save();

    const token = jwt.sign(
      { id: savedAdmin._id, email: savedAdmin.email, role: 'admin', name: savedAdmin.name },
      process.env.JWT_SECRET || 'bookversesecrettokenkey12345',
      { expiresIn: '30d' }
    );

    res.status(201).json({
      token,
      admin: {
        id: savedAdmin._id,
        name: savedAdmin.name,
        email: savedAdmin.email
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Login Admin
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Please enter all fields' });
    }

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(400).json({ message: 'Admin does not exist' });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: admin._id, email: admin.email, role: 'admin', name: admin.name },
      process.env.JWT_SECRET || 'bookversesecrettokenkey12345',
      { expiresIn: '30d' }
    );

    res.json({
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Dashboard Summary Stats
const getDashboardStats = async (req, res) => {
  try {
    const usersCount = await User.countDocuments();
    const vendorsCount = await Seller.countDocuments();
    const itemsCount = await Book.countDocuments();
    const ordersCount = await Order.countDocuments();

    res.json({
      users: usersCount,
      vendors: vendorsCount,
      items: itemsCount,
      orders: ordersCount
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// List all Users
const listUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Edit User
const editUser = async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (name) user.name = name;
    if (email) user.email = email;

    const updatedUser = await user.save();
    res.json({
      id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete User
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    await User.findByIdAndDelete(req.params.id);
    // Delete user orders too for data consistency
    await Order.deleteMany({ userId: req.params.id });
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// List all Sellers (Vendors)
const listSellers = async (req, res) => {
  try {
    const sellers = await Seller.find().select('-password');
    res.json(sellers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Approve Seller
const approveSeller = async (req, res) => {
  try {
    const seller = await Seller.findById(req.params.id);
    if (!seller) {
      return res.status(404).json({ message: 'Seller not found' });
    }
    seller.isApproved = true;
    await seller.save();
    res.json({ message: 'Seller approved successfully', seller });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete Seller
const deleteSeller = async (req, res) => {
  try {
    const seller = await Seller.findById(req.params.id);
    if (!seller) {
      return res.status(404).json({ message: 'Seller not found' });
    }
    await Seller.findByIdAndDelete(req.params.id);
    // Delete seller's books
    await Book.deleteMany({ sellerId: req.params.id });
    res.json({ message: 'Seller deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Orders by User ID
const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete Order (Trash button on Order Modal)
const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    await Order.findByIdAndDelete(req.params.id);
    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
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
};
