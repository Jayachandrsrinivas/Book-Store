const mongoose = require('mongoose');
require('dotenv').config();

const Admin = require('./models/Admin/AdminSchema');
const Seller = require('./models/Seller/SellerSchema');
const User = require('./models/Users/UserSchema');
const Book = require('./models/Users/BookSchema');
const Order = require('./models/Users/MyOrderSchema');
const connectDB = require('./db/config');

const runVerification = async () => {
  try {
    await connectDB();
    console.log('--- DB Verification Start ---');

    const admins = await Admin.find();
    console.log(`Admins found: ${admins.length}`);
    admins.forEach(a => console.log(`  - Name: ${a.name}, Email: ${a.email}`));

    const sellers = await Seller.find();
    console.log(`Sellers found: ${sellers.length}`);
    sellers.forEach(s => console.log(`  - Name: ${s.name}, Email: ${s.email}, Approved: ${s.isApproved}`));

    const users = await User.find();
    console.log(`Users found: ${users.length}`);
    users.forEach(u => console.log(`  - Name: ${u.name}, Email: ${u.email}`));

    const books = await Book.find();
    console.log(`Books found: ${books.length}`);
    books.forEach(b => console.log(`  - Title: ${b.title}, Author: ${b.author}, Price: Rs ${b.price}`));

    const orders = await Order.find();
    console.log(`Orders found: ${orders.length}`);
    orders.forEach(o => console.log(`  - Order ID: ${o._id}, Buyer: ${o.customerName}, Price: ₹${o.price}, Status: ${o.status}`));

    console.log('--- Verification Complete: SUCCESS ---');
    process.exit(0);
  } catch (error) {
    console.error('Verification failed with error:', error.message);
    process.exit(1);
  }
};

runVerification();
