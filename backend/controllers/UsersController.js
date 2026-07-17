const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/Users/UserSchema');
const Book = require('../models/Users/BookSchema');
const Order = require('../models/Users/MyOrderSchema');

// Register User
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please enter all fields' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      email,
      password: hashedPassword
    });

    const savedUser = await newUser.save();

    const token = jwt.sign(
      { id: savedUser._id, email: savedUser.email, role: 'user', name: savedUser.name },
      process.env.JWT_SECRET || 'bookversesecrettokenkey12345',
      { expiresIn: '30d' }
    );

    res.status(201).json({
      token,
      user: {
        id: savedUser._id,
        name: savedUser.name,
        email: savedUser.email
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Login User
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Please enter all fields' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User does not exist' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: 'user', name: user.name },
      process.env.JWT_SECRET || 'bookversesecrettokenkey12345',
      { expiresIn: '30d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get User Profile
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update User Profile
const updateUserProfile = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (name) user.name = name;
    if (email) user.email = email;

    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

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

// Browse Books with search & filter
const getBooks = async (req, res) => {
  try {
    const { search, genre } = req.query;
    let query = {};

    if (genre && genre !== 'All') {
      // Direct comparison or regex search for sub-genres
      query.genre = { $regex: genre, $options: 'i' };
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } }
      ];
    }

    const books = await Book.find(query);
    res.json(books);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Book Details
const getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    res.json(book);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Place Order
const placeOrder = async (req, res) => {
  try {
    const { bookId, customerName, address, price } = req.body;

    if (!bookId || !customerName || !address) {
      return res.status(400).json({ message: 'Missing required checkout details' });
    }

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    if (book.quantity <= 0) {
      return res.status(400).json({ message: 'Book is out of stock' });
    }

    // Decrement stock
    book.quantity = book.quantity - 1;
    await book.save();

    // Set delivery date to 5 days from now
    const bookingDate = new Date();
    const deliveryDate = new Date();
    deliveryDate.setDate(bookingDate.getDate() + 5);

    const newOrder = new Order({
      userId: req.user.id,
      bookId: book._id,
      productName: book.title,
      customerName,
      address,
      sellerId: book.sellerId,
      sellerName: book.sellerName || 'Pravanshu',
      bookingDate,
      deliveryDate,
      warranty: '1 year',
      price: price ? Number(price) : book.price,
      status: 'ontheway',
      image: book.image
    });

    const savedOrder = await newOrder.save();
    res.status(201).json(savedOrder);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get User Orders
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  getBooks,
  getBookById,
  placeOrder,
  getMyOrders
};
