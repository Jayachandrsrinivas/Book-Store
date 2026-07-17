const mongoose = require('mongoose');

const writtenBySchema = new mongoose.Schema({
  bookId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true,
  },
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Author',
    required: true,
  }
});

// Compound unique index so a book-author link is not duplicated
writtenBySchema.index({ bookId: 1, authorId: 1 }, { unique: true });

module.exports = mongoose.model('WrittenBy', writtenBySchema);
