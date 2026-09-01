const mongoose = require('mongoose');
require('dotenv').config();

const test = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    process.exit();
  }
}
test();
