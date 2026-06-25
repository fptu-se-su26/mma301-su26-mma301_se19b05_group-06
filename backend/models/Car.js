const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
  brand: String,
  model: String,
  imageUrl: String,
  pricePerDay: Number,
  rating: Number,
  location: String,
  type: String,
  seats: Number,
  transmission: String,
  fuelType: String,
});

module.exports = mongoose.model('Car', carSchema);
