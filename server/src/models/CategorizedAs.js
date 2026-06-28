const mongoose = require('mongoose');

const categorizedAsSchema = new mongoose.Schema({
  bookId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true,
  },
  genreId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Genre',
    required: true,
  }
});

categorizedAsSchema.index({ bookId: 1, genreId: 1 }, { unique: true });

module.exports = mongoose.model('CategorizedAs', categorizedAsSchema);
