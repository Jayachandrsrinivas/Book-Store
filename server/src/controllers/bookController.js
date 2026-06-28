const Book = require('../models/Book');
const Author = require('../models/Author');
const Genre = require('../models/Genre');
const WrittenBy = require('../models/WrittenBy');
const CategorizedAs = require('../models/CategorizedAs');
const Inventory = require('../models/Inventory');
const Interaction = require('../models/Interaction');

// Helper to assemble full book details (authors, genres, inventory, rating stats)
const getCompleteBookData = async (book) => {
  const bookId = book._id;

  // 1. Get Authors
  const writtenLinks = await WrittenBy.find({ bookId }).populate('authorId');
  const authors = writtenLinks.map(link => link.authorId).filter(Boolean);

  // 2. Get Genres
  const categoryLinks = await CategorizedAs.find({ bookId }).populate('genreId');
  const genres = categoryLinks.map(link => link.genreId).filter(Boolean);

  // 3. Get Inventory (1:M, retrieve all copies/locations)
  const inventoryItems = await Inventory.find({ bookId });

  // 4. Calculate Average Rating
  const interactions = await Interaction.find({ bookId, rating: { $exists: true } });
  const totalRating = interactions.reduce((sum, item) => sum + item.rating, 0);
  const avgRating = interactions.length > 0 ? (totalRating / interactions.length).toFixed(1) : 0;

  return {
    ...book.toObject(),
    authors,
    genres,
    inventory: inventoryItems,
    rating: parseFloat(avgRating),
    reviewCount: interactions.length,
  };
};

// @desc    Get all books with optional search, author, genre filters
// @route   GET /api/books
// @access  Public
const getBooks = async (req, res) => {
  try {
    const { search, genre, author } = req.query;
    let queryBookIds = null;

    // Filter by author name match
    if (author) {
      const authorsMatched = await Author.find({ name: { $regex: author, $options: 'i' } });
      const authorIds = authorsMatched.map(a => a._id);
      const writtenLinks = await WrittenBy.find({ authorId: { $in: authorIds } });
      const bookIds = writtenLinks.map(w => w.bookId);
      queryBookIds = bookIds;
    }

    // Filter by genre name match
    if (genre) {
      const genresMatched = await Genre.find({ name: { $regex: genre, $options: 'i' } });
      const genreIds = genresMatched.map(g => g._id);
      const categoryLinks = await CategorizedAs.find({ genreId: { $in: genreIds } });
      const bookIds = categoryLinks.map(c => c.bookId);
      
      if (queryBookIds) {
        // Intersection of authors & genres
        queryBookIds = queryBookIds.filter(id => bookIds.some(bid => bid.toString() === id.toString()));
      } else {
        queryBookIds = bookIds;
      }
    }

    // Main Book query
    let bookFilter = {};
    if (queryBookIds) {
      bookFilter._id = { $in: queryBookIds };
    }

    if (search) {
      bookFilter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const books = await Book.find(bookFilter);
    const completeBooks = await Promise.all(books.map(book => getCompleteBookData(book)));

    res.json(completeBooks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get book details by ID
// @route   GET /api/books/:id
// @access  Public
const getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    const completeBook = await getCompleteBookData(book);
    res.json(completeBook);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new book listing (Seller or Admin)
// @route   POST /api/books
// @access  Private (Seller/Admin)
const createBook = async (req, res) => {
  const { title, description, price, authors, genres, inventory } = req.body;
  try {
    // 1. Create base Book
    const book = await Book.create({
      title,
      description,
      price,
      sellerId: req.user._id,
      availabilityStatus: (inventory && inventory.quantity > 0) ? 'in-stock' : 'out-of-stock'
    });

    // 2. Link Authors (Create author if doesn't exist by name string, or link if ObjectId)
    if (authors && Array.isArray(authors)) {
      for (const authorInput of authors) {
        let author;
        if (authorInput.name) {
          author = await Author.findOne({ name: authorInput.name });
          if (!author) {
            author = await Author.create({ name: authorInput.name, bio: authorInput.bio || '' });
          }
        } else if (typeof authorInput === 'string') {
          author = await Author.findOne({ name: authorInput });
          if (!author) {
            author = await Author.create({ name: authorInput });
          }
        }
        if (author) {
          await WrittenBy.create({ bookId: book._id, authorId: author._id });
        }
      }
    }

    // 3. Link Genres (Link by name or create if missing)
    if (genres && Array.isArray(genres)) {
      for (const genreInput of genres) {
        let genre;
        const genreName = typeof genreInput === 'string' ? genreInput : genreInput.name;
        if (genreName) {
          genre = await Genre.findOne({ name: genreName });
          if (!genre) {
            genre = await Genre.create({ name: genreName, description: genreInput.description || '' });
          }
          await CategorizedAs.create({ bookId: book._id, genreId: genre._id });
        }
      }
    }

    // 4. Create Inventory record
    if (inventory) {
      await Inventory.create({
        bookId: book._id,
        quantity: inventory.quantity || 0,
        location: inventory.location || 'Main Warehouse',
        condition: inventory.condition || 'new',
      });
    } else {
      await Inventory.create({ bookId: book._id, quantity: 0 });
    }

    const completeBook = await getCompleteBookData(book);
    res.status(201).json(completeBook);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update book listing (Seller/Admin)
// @route   PUT /api/books/:id
// @access  Private (Seller/Admin)
const updateBook = async (req, res) => {
  const { title, description, price, availabilityStatus, authors, genres, inventory } = req.body;
  try {
    let book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // Authorization: Must be owner or admin
    if (book.sellerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this book' });
    }

    book.title = title || book.title;
    book.description = description || book.description;
    book.price = price !== undefined ? price : book.price;
    book.availabilityStatus = availabilityStatus || book.availabilityStatus;
    await book.save();

    // Re-link Authors if provided
    if (authors && Array.isArray(authors)) {
      await WrittenBy.deleteMany({ bookId: book._id });
      for (const authorInput of authors) {
        let author;
        const authorName = typeof authorInput === 'string' ? authorInput : authorInput.name;
        if (authorName) {
          author = await Author.findOne({ name: authorName });
          if (!author) {
            author = await Author.create({ name: authorName, bio: authorInput.bio || '' });
          }
          await WrittenBy.create({ bookId: book._id, authorId: author._id });
        }
      }
    }

    // Re-link Genres if provided
    if (genres && Array.isArray(genres)) {
      await CategorizedAs.deleteMany({ bookId: book._id });
      for (const genreInput of genres) {
        let genre;
        const genreName = typeof genreInput === 'string' ? genreInput : genreInput.name;
        if (genreName) {
          genre = await Genre.findOne({ name: genreName });
          if (!genre) {
            genre = await Genre.create({ name: genreName, description: genreInput.description || '' });
          }
          await CategorizedAs.create({ bookId: book._id, genreId: genre._id });
        }
      }
    }

    // Update Inventory
    if (inventory) {
      let inv = await Inventory.findOne({ bookId: book._id });
      if (inv) {
        inv.quantity = inventory.quantity !== undefined ? inventory.quantity : inv.quantity;
        inv.location = inventory.location || inv.location;
        inv.condition = inventory.condition || inv.condition;
        await inv.save();
      } else {
        await Inventory.create({
          bookId: book._id,
          quantity: inventory.quantity || 0,
          location: inventory.location || 'Main Warehouse',
          condition: inventory.condition || 'new',
        });
      }

      // Automatically set availability
      const totalStock = await Inventory.find({ bookId: book._id });
      const sumStock = totalStock.reduce((acc, current) => acc + current.quantity, 0);
      book.availabilityStatus = sumStock > 0 ? 'in-stock' : 'out-of-stock';
      await book.save();
    }

    const completeBook = await getCompleteBookData(book);
    res.json(completeBook);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete book listing (Seller/Admin)
// @route   DELETE /api/books/:id
// @access  Private (Seller/Admin)
const deleteBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    if (book.sellerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this book' });
    }

    // Delete related relationships
    await WrittenBy.deleteMany({ bookId: book._id });
    await CategorizedAs.deleteMany({ bookId: book._id });
    await Inventory.deleteMany({ bookId: book._id });
    await Interaction.deleteMany({ bookId: book._id });
    
    // Delete the Book itself
    await Book.deleteOne({ _id: book._id });

    res.json({ message: 'Book and related records deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create/Update review and reading progress (User interaction)
// @route   POST /api/books/:id/interact
// @access  Private
const interactWithBook = async (req, res) => {
  const { rating, reviewText, readingProgress } = req.body;
  const bookId = req.params.id;
  const userId = req.user._id;

  try {
    const bookExists = await Book.findById(bookId);
    if (!bookExists) {
      return res.status(404).json({ message: 'Book not found' });
    }

    let interaction = await Interaction.findOne({ userId, bookId });
    if (interaction) {
      if (rating !== undefined) interaction.rating = rating;
      if (reviewText !== undefined) interaction.reviewText = reviewText;
      if (readingProgress !== undefined) interaction.readingProgress = readingProgress;
      await interaction.save();
    } else {
      interaction = await Interaction.create({
        userId,
        bookId,
        rating,
        reviewText,
        readingProgress: readingProgress || 0,
      });
    }

    res.json({ message: 'Interaction saved successfully', interaction });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get interactions/reviews for a book
// @route   GET /api/books/:id/reviews
// @access  Public
const getBookReviews = async (req, res) => {
  try {
    const reviews = await Interaction.find({ bookId: req.params.id })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  interactWithBook,
  getBookReviews,
};
