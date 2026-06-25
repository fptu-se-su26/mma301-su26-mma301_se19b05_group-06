const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  car: { type: mongoose.Schema.Types.ObjectId, ref: 'Car', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  startDate: { type: String, required: true }, // YYYY-MM-DD
  endDate: { type: String, required: true }, // YYYY-MM-DD
  totalPrice: { type: Number, required: true },
  status: { type: String, enum: ['Pending', 'Approved', 'Completed', 'Cancelled'], default: 'Pending' },
  notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.models.Booking || mongoose.model('Booking', bookingSchema);
