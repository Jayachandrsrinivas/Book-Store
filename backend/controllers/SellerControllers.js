const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Seller = require('../models/Seller/SellerSchema');
const Book = require('../models/Users/BookSchema');
const Order = require('../models/Users/MyOrderSchema');

// Register Seller
const registerSeller = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please enter all fields' });
    }

    const existingSeller = await Seller.findOne({ email });
    if (existingSeller) {
      return res.status(400).json({ message: 'Seller already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newSeller = new Seller({
      name,
      email,
      password: hashedPassword,
      isApproved: false // Requires admin approval
    });

    const savedSeller = await newSeller.save();

    res.status(201).json({
      message: 'Registration successful! Pending Admin Approval.',
      seller: {
        id: savedSeller._id,
        name: savedSeller.name,
        email: savedSeller.email,
        isApproved: savedSeller.isApproved
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Login Seller
const loginSeller = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Please enter all fields' });
    }

    const seller = await Seller.findOne({ email });
    if (!seller) {
      return res.status(400).json({ message: 'Seller does not exist' });
    }

    const isMatch = await bcrypt.compare(password, seller.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    if (!seller.isApproved) {
      return res.status(403).json({ message: 'Your account is pending Admin approval.' });
    }

    const token = jwt.sign(
      { id: seller._id, email: seller.email, role: 'seller', name: seller.name },
      process.env.JWT_SECRET || 'bookversesecrettokenkey12345',
      { expiresIn: '30d' }
    );

    res.json({
      token,
      seller: {
        id: seller._id,
        name: seller.name,
        email: seller.email
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Seller Dashboard Stats
const getSellerStats = async (req, res) => {
  try {
    const itemsCount = await Book.countDocuments({ sellerId: req.user.id });
    const ordersCount = await Order.countDocuments({ sellerId: req.user.id });

    res.json({
      items: itemsCount,
      orders: ordersCount
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// List Seller's Books
const getMyBooks = async (req, res) => {
  try {
    const books = await Book.find({ sellerId: req.user.id });
    res.json(books);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add Book
const addBook = async (req, res) => {
  try {
    const { title, author, genre, price, description, quantity } = req.body;
    if (!title || !author || !genre || !price || !description) {
      return res.status(400).json({ message: 'Please fill in all required fields' });
    }

    let image = '';
    if (req.file) {
      image = req.file.filename;
    }

    const newBook = new Book({
      title,
      author,
      genre,
      description,
      price: Number(price),
      quantity: quantity ? Number(quantity) : 10,
      image,
      sellerId: req.user.id,
      sellerName: req.user.name
    });

    const savedBook = await newBook.save();
    res.status(201).json(savedBook);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update Book
const updateBook = async (req, res) => {
  try {
    const { title, author, genre, price, description, quantity } = req.body;
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    if (book.sellerId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to edit this book' });
    }

    if (title) book.title = title;
    if (author) book.author = author;
    if (genre) book.genre = genre;
    if (price) book.price = Number(price);
    if (description) book.description = description;
    if (quantity) book.quantity = Number(quantity);

    if (req.file) {
      book.image = req.file.filename;
    }

    const updatedBook = await book.save();
    res.json(updatedBook);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete Book
const deleteBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    if (book.sellerId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this book' });
    }

    await Book.findByIdAndDelete(req.params.id);
    res.json({ message: 'Book deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// List orders placed for this Seller's books
const getSellerOrders = async (req, res) => {
  try {
    const orders = await Order.find({ sellerId: req.user.id });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update Order Status (e.g. to 'ontheway')
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.sellerId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this order' });
    }

    order.status = status;
    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  registerSeller,
  loginSeller,
  getSellerStats,
  getMyBooks,
  addBook,
  updateBook,
  deleteBook,
  getSellerOrders,
  updateOrderStatus
};
