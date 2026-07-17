const mongoose = require('mongoose');

const interactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  bookId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true,
  },
  readingProgress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0,
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
  },
  reviewText: {
    type: String,
    trim: true,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

// A user can interact with a book in various ways, but let's make user-book a unique pairing for rating/reviewing
interactionSchema.index({ userId: 1, bookId: 1 }, { unique: true });

module.exports = mongoose.model('Interaction', interactionSchema);
