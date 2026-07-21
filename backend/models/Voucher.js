const mongoose = require('mongoose');

const VoucherSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  discountType: { type: String, enum: ['percentage', 'fixed'], required: true },
  discountValue: { type: Number, required: true },
  minBookingValue: { type: Number, default: 0 },
  maxUsage: { type: Number },
  usedCount: { type: Number, default: 0 },
  expiryDate: { type: Date },
  isActive: { type: Boolean, default: true },
  description: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Voucher', VoucherSchema);
