const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
  brand: { type: String, required: true },
  model: { type: String, required: true },
  imageUrl: { type: String },
  pricePerDay: { type: Number, required: true },
  rating: { type: Number, default: 5.0 },
  location: { type: String },
  type: { type: String },
  seats: { type: Number },
  transmission: { type: String },
  fuelType: { type: String }
}, { timestamps: true });

module.exports = mongoose.models.Car || mongoose.model('Car', carSchema);
