require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const connectDB = require('./db/config');
const Admin = require('./models/Admin/AdminSchema');
const Seller = require('./models/Seller/SellerSchema');
const User = require('./models/Users/UserSchema');
const Book = require('./models/Users/BookSchema');
const Order = require('./models/Users/MyOrderSchema');

const seedData = async () => {
  try {
    // Connect to database
    await connectDB();

    console.log('Clearing existing data...');
    await Admin.deleteMany();
    await Seller.deleteMany();
    await User.deleteMany();
    await Book.deleteMany();
    await Order.deleteMany();

    console.log('Seeding users...');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);
    const sellerPassword = await bcrypt.hash('seller123', salt);
    const userPassword = await bcrypt.hash('ram123', salt);
    const akashPassword = await bcrypt.hash('akash123', salt);

    // 1. Seed Admin
    const admin = new Admin({
      name: 'Abhi',
      email: 'admin@bookstore.com',
      password: hashedPassword
    });
    const savedAdmin = await admin.save();
    savedAdmin.userId = savedAdmin._id;
    await savedAdmin.save();

    // 2. Seed Sellers
    const seller = new Seller({
      name: 'Pravanshu',
      email: 'seller@bookstore.com',
      password: sellerPassword,
      isApproved: true
    });
    const savedSeller = await seller.save();

    const pendingSeller = new Seller({
      name: 'John Doe Books',
      email: 'john@books.com',
      password: sellerPassword,
      isApproved: false
    });
    await pendingSeller.save();

    // 3. Seed Users
    const userRam = new User({
      name: 'Ram',
      email: 'ram@gmail.com',
      password: userPassword
    });
    const savedUserRam = await userRam.save();

    const userAkash = new User({
      name: 'Akash',
      email: 'akash@gmail.com',
      password: akashPassword
    });
    const savedUserAkash = await userAkash.save();

    const userSiya = new User({
      name: 'Siya',
      email: 'siya@gmail.com',
      password: userPassword
    });
    await userSiya.save();

    console.log('Seeding books...');
    // Create uploads folder and ensure seed files are referenced
    const uploadsDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Touch mock cover files so backend doesn't crash if they are requested
    fs.writeFileSync(path.join(uploadsDir, 'the_alchemist.jpg'), '');
    fs.writeFileSync(path.join(uploadsDir, 'atomic_habits.jpg'), '');
    fs.writeFileSync(path.join(uploadsDir, 'rich_dad_poor_dad.jpg'), '');
    fs.writeFileSync(path.join(uploadsDir, 'think_and_grow_rich.jpg'), '');
    fs.writeFileSync(path.join(uploadsDir, 'dont_let_her_stay.jpg'), '');
    fs.writeFileSync(path.join(uploadsDir, 'killing_the_witches.jpg'), '');

    const book1 = new Book({
      title: 'The Alchemist',
      author: 'Paulo Coelho',
      genre: 'Fiction / Inspirational',
      description: 'A shepherd boy named Santiago embarks on a journey to discover his personal legend and fulfill his destiny. Along the way, he learns to listen to his heart and read the signs written in the desert.',
      price: 399,
      quantity: 10,
      image: 'the_alchemist.jpg',
      sellerId: savedSeller._id,
      sellerName: savedSeller.name
    });
    const savedBook1 = await book1.save();

    const book2 = new Book({
      title: 'Atomic Habits',
      author: 'James Clear',
      genre: 'Self-help / Psychology',
      description: 'A practical guide to building good habits and breaking bad ones, backed by scientific research. James Clear outlines actionable frameworks to help you achieve 1% improvement every day.',
      price: 450,
      quantity: 8,
      image: 'atomic_habits.jpg',
      sellerId: savedSeller._id,
      sellerName: savedSeller.name
    });
    const savedBook2 = await book2.save();

    // Additional books for categories
    const book3 = new Book({
      title: 'Rich Dad Poor Dad',
      author: 'Robert T. Kiyosaki',
      genre: 'Biographies',
      description: 'What the rich teach their kids about money that the poor and middle class do not! Explodes the myth that you need to earn a high income to become rich.',
      price: 299,
      quantity: 12,
      image: 'rich_dad_poor_dad.jpg',
      sellerId: savedSeller._id,
      sellerName: savedSeller.name
    });
    await book3.save();

    const book4 = new Book({
      title: 'Think and Grow Rich',
      author: 'Napoleon Hill',
      genre: 'Science',
      description: 'Napoleon Hill teaches the core principles of personal achievement and financial success based on interviews with over 500 wealthy individuals.',
      price: 349,
      quantity: 5,
      image: 'think_and_grow_rich.jpg',
      sellerId: savedSeller._id,
      sellerName: savedSeller.name
    });
    await book4.save();

    const book5 = new Book({
      title: "Don't Let Her Stay",
      author: 'Nicola Sanders',
      genre: 'Fiction',
      description: 'A gripping psychological thriller that will keep you guessing until the very last page. When a stepdaughter moves in, things begin to turn dark.',
      price: 250,
      quantity: 15,
      image: 'dont_let_her_stay.jpg',
      sellerId: savedSeller._id,
      sellerName: savedSeller.name
    });
    await book5.save();

    const book6 = new Book({
      title: 'Killing the Witches',
      author: 'Bill O\'Reilly',
      genre: 'Children\'s Books',
      description: 'The horror of Salem, Massachusetts, detailing the historical witch trials and their aftermath in American history.',
      price: 498,
      quantity: 6,
      image: 'killing_the_witches.jpg',
      sellerId: savedSeller._id,
      sellerName: savedSeller.name
    });
    const savedBook6 = await book6.save();

    console.log('Seeding orders...');
    // Order 1 (Ram order)
    const order1 = new Order({
      userId: savedUserRam._id,
      bookId: savedBook2._id,
      productName: `${savedBook2.title} - 59c5`,
      customerName: savedUserRam.name,
      address: '173, Mayur Vihar Phase-1, Delhi (110091), Delhi',
      sellerId: savedSeller._id,
      sellerName: savedSeller.name,
      bookingDate: new Date('2025-08-08'),
      deliveryDate: new Date('2025-08-13'),
      warranty: '1 year',
      price: 549,
      status: 'ontheway',
      image: 'atomic_habits.jpg'
    });
    await order1.save();

    // Order 2 (Akash order)
    const order2 = new Order({
      userId: savedUserAkash._id,
      bookId: savedBook1._id,
      productName: savedBook1.title,
      customerName: savedUserAkash.name,
      address: 'Balaji Medical, Datia (475661), Madhya Pradesh',
      sellerId: savedSeller._id,
      sellerName: savedSeller.name,
      bookingDate: new Date('2025-08-08'),
      deliveryDate: new Date('2025-08-13'),
      warranty: '1 year',
      price: 498,
      status: 'ontheway',
      image: 'the_alchemist.jpg'
    });
    await order2.save();

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error(`Error seeding database: ${error.message}`);
    process.exit(1);
  }
};

seedData();
