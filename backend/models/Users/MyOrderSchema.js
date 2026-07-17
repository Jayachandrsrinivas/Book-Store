const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  bookId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true
  },
  productName: {
    type: String,
    required: true
  },
  customerName: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Seller',
    required: true
  },
  sellerName: {
    type: String
  },
  bookingDate: {
    type: Date,
    default: Date.now
  },
  deliveryDate: {
    type: Date
  },
  warranty: {
    type: String,
    default: '1 year'
  },
  price: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    default: 'ontheway'
  },
  image: {
    type: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
