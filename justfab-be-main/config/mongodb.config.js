const { MONGO_CONNECTION_STRING } = process.env;
const mongoose = require('mongoose');

const connectMongoDB = async () => {
  try {
    await mongoose.connect(MONGO_CONNECTION_STRING, {});
    console.log('MongoDB connected');
  } catch (err) {
    console.error(err.message);
    process.exit(1); // Exit process with failure
  }
};

module.exports = { connectMongoDB };
