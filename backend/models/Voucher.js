const mongoose = require('mongoose');

const voucherSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true },
  discountType: { type: String, enum: ['percentage', 'fixed'], required: true },
  discountValue: { type: Number, required: true },
  minBookingValue: { type: Number, default: 0 },
  expiryDate: { type: Date },
  maxUsage: { type: Number, default: 100 },
  usedCount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  description: { type: String },
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Voucher', voucherSchema);
