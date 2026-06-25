const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  carId: { type: mongoose.Schema.Types.ObjectId, ref: 'Car', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  
  status: { 
    type: String, 
    enum: ['Pending', 'Confirmed', 'Approved', 'Completed', 'Cancelled'], 
    default: 'Pending' 
  },
  
  paymentStatus: { 
    type: String, 
    enum: ['pending', 'paid', 'refunded'], 
    default: 'pending' 
  },
  
  totalPrice: { type: Number, required: true },
  pricePerDay: { type: Number, required: true },
  numberOfDays: { type: Number, required: true },
  
  lateFee: { type: Number, default: 0 },
  
  pickupLocation: String,
  dropoffLocation: String,
  
  notes: String,
  adminNotes: String,
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Booking', BookingSchema);
