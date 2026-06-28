const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./src/config/db');

// Route files
const authRoutes = require('./src/routes/authRoutes');
const bookRoutes = require('./src/routes/bookRoutes');
const orderRoutes = require('./src/routes/orderRoutes');
const sellerRoutes = require('./src/routes/sellerRoutes');
const adminRoutes = require('./src/routes/adminRoutes');

// Load environment variables
dotenv.config();

// Initialize app
const app = express();

// Middlewares
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.FRONTEND_URL, // Vercel production URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (Render health checks, curl, mobile apps)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: Origin ${origin} not allowed`));
  },
  credentials: true,
}));
app.use(express.json());

const mongoose = require('mongoose');
// Check database connectivity state
const dbCheck = (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      message: 'Database is currently offline. Please ensure MongoDB is running and MONGODB_URI in server/.env is correct.'
    });
  }
  next();
};

// Mount API routes with connection check
app.use('/api', dbCheck);
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/seller', sellerRoutes);
app.use('/api/admin', adminRoutes);

// Simple health check route
app.get('/', (req, res) => {
  res.json({ message: 'BookStore REST API is running...' });
});

// Seed data function
const seedInitialData = async () => {
  try {
    const User = require('./src/models/User');
    const Book = require('./src/models/Book');
    const Author = require('./src/models/Author');
    const Genre = require('./src/models/Genre');
    const WrittenBy = require('./src/models/WrittenBy');
    const CategorizedAs = require('./src/models/CategorizedAs');
    const Inventory = require('./src/models/Inventory');

    // 1. Seed Admin
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@bookstore.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'adminpassword';
    let admin = await User.findOne({ email: adminEmail });
    if (!admin) {
      admin = await User.create({
        name: 'App Admin',
        email: adminEmail,
        password: adminPassword,
        role: 'admin',
      });
      console.log(`Seeded Admin Account: ${adminEmail} / ${adminPassword}`);
    }

    // 2. Seed Seller
    let seller = await User.findOne({ email: 'seller@bookstore.com' });
    if (!seller) {
      seller = await User.create({
        name: 'Main Publisher',
        email: 'seller@bookstore.com',
        password: 'sellerpassword',
        role: 'seller',
        businessName: 'BookEase Publishing Group',
      });
      console.log('Seeded Seller Account: seller@bookstore.com / sellerpassword');
    }

    // 3. Seed Genres
    const genresData = [
      { name: 'Fiction', description: 'Literary works of imaginative narration.' },
      { name: 'Non-Fiction', description: 'Informative, factual, and real-world topics.' },
      { name: 'Science', description: 'Explorations of nature, physics, and modern technology.' },
      { name: 'Romance', description: 'Stories focused on relationships and romantic love.' },
      { name: 'Children', description: 'Books aimed at young readers and toddlers.' }
    ];

    const genresList = [];
    for (const g of genresData) {
      let existingGenre = await Genre.findOne({ name: g.name });
      if (!existingGenre) {
        existingGenre = await Genre.create(g);
      }
      genresList.push(existingGenre);
    }

    // 4. Seed Books, Authors, WrittenBy, CategorizedAs, Inventory
    const booksCount = await Book.countDocuments();
    if (booksCount === 0) {
      // Books & Authors to create
      const sampleBooks = [
        {
          title: 'The Great Gatsby',
          description: 'A classic story of wealth, love, and the American Dream in the Roaring Twenties.',
          price: 14.99,
          authorName: 'F. Scott Fitzgerald',
          authorBio: 'An American novelist and short story writer, widely regarded as one of the greatest writers of the 20th century.',
          genreName: 'Fiction',
          quantity: 15,
          location: 'Aisle 3A',
          condition: 'new'
        },
        {
          title: 'A Brief History of Time',
          description: 'A landmark science book explanation of cosmology, black holes, space, and time.',
          price: 24.95,
          authorName: 'Stephen Hawking',
          authorBio: 'An English theoretical physicist, cosmologist, and author who was director of research at the Centre for Theoretical Cosmology.',
          genreName: 'Science',
          quantity: 8,
          location: 'Aisle 7B',
          condition: 'new'
        },
        {
          title: 'Pride and Prejudice',
          description: 'A romantic masterpiece examining the clash between love, status, and early social judgments.',
          price: 11.99,
          authorName: 'Jane Austen',
          authorBio: 'An English novelist known primarily for her six major novels, which interpret, critique and comment upon the British landed gentry.',
          genreName: 'Romance',
          quantity: 12,
          location: 'Aisle 2C',
          condition: 'new'
        }
      ];

      for (const sample of sampleBooks) {
        // Create Author
        let author = await Author.findOne({ name: sample.authorName });
        if (!author) {
          author = await Author.create({ name: sample.authorName, bio: sample.authorBio });
        }

        // Create Book
        const book = await Book.create({
          title: sample.title,
          description: sample.description,
          price: sample.price,
          sellerId: seller._id,
          availabilityStatus: 'in-stock'
        });

        // Link Author
        await WrittenBy.create({ bookId: book._id, authorId: author._id });

        // Link Genre
        const genreObj = genresList.find(g => g.name === sample.genreName);
        if (genreObj) {
          await CategorizedAs.create({ bookId: book._id, genreId: genreObj._id });
        }

        // Create Inventory
        await Inventory.create({
          bookId: book._id,
          quantity: sample.quantity,
          location: sample.location,
          condition: sample.condition
        });
      }
      console.log('Seeded default catalog of books and inventories successfully.');
    }
  } catch (err) {
    console.error('Data seeding failed:', err.message);
  }
};

// Connect to DB and start listening
const PORT = process.env.PORT || 5000;
connectDB().then(async (isConnected) => {
  if (isConnected) {
    // Run seeder
    await seedInitialData();
  } else {
    console.warn('Database seeding skipped. Running server in offline-mode.');
  }

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
