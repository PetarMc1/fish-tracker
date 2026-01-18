const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI;

mongoose.set('strictQuery', false);

async function connectDB() {
  if (mongoose.connection.readyState === 1) return mongoose;
  try {
    await mongoose.connect(MONGO_URI, { dbName: 'fishtracker' });
    console.log('Database connected');
    return mongoose;
  } catch (err) {
    console.error('Database connection error:', err.message || err);
    throw err;
  }
}

module.exports = { connectDB, mongoose };
