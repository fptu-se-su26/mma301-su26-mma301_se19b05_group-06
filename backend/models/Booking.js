const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  carId: { type: mongoose.Schema.Types.ObjectId, ref: 'Car', required: true },
  car: { type: mongoose.Schema.Types.ObjectId, ref: 'Car' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  pickupDate: { type: Date },
  returnDate: { type: Date },
  
  customerName: { type: String },
  customerPhone: { type: String },
  customerEmail: { type: String },
  transactionId: { type: String },
  orderCode: { type: Number, unique: true, sparse: true },
  note: { type: String },
  
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
  
  paymentMethod: {
    type: String,
    enum: ['bank_transfer', 'vietqr', 'momo'],
    default: 'bank_transfer'
  },
  
  totalPrice: { type: Number, required: true },
  pricePerDay: { type: Number, required: true },
  numberOfDays: { type: Number, required: true },
  
  lateFee: { type: Number, default: 0 },
  
  pickupLocation: String,
  dropoffLocation: String,
  
  notes: String,
  adminNotes: String,
  
  pendingExtension: {
    newEndDate: { type: Date },
    extraDays: { type: Number },
    addedFee: { type: Number },
    orderCode: { type: Number }
  },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Booking', BookingSchema);
