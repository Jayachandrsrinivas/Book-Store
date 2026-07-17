const mongoose = require('mongoose');

// Disable query buffering so mongoose fails immediately when MongoDB is offline
mongoose.set('bufferCommands', false);

const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI ;
  try {
    // In newer Mongoose versions, options like useNewUrlParser and useUnifiedTopology are obsolete
    await mongoose.connect(mongoURI);
    console.log(`MongoDB Connected successfully to: ${mongoURI}`);
    return true;
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    console.warn('Ensure MongoDB is running locally, or configure a working MONGODB_URI in server/.env.');
    return false;
  }
};

module.exports = connectDB;
