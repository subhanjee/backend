const mongoose = require('mongoose');

const dbConnect = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log('db Connected');
  } catch (e) {
    console.log(`Error ${e.message}`);
  }
};

module.exports = dbConnect;
