const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  bookId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 0,
    default: 0,
  },
  location: {
    type: String,
    required: true,
    trim: true,
    default: 'Main Warehouse',
  },
  condition: {
    type: String,
    enum: ['new', 'used', 'damaged'],
    default: 'new',
  }
});

module.exports = mongoose.model('Inventory', inventorySchema);
