const mongoose = require('mongoose');

const voucherSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  discountType: { type: String, enum: ['percentage', 'fixed'], required: true },
  discountValue: { type: Number, required: true },
  minBookingValue: { type: Number, default: 0 },
  expiryDate: { type: String }, // YYYY-MM-DD
  maxUsage: { type: Number },
  usedCount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  description: { type: String }
}, { timestamps: true });

module.exports = mongoose.models.Voucher || mongoose.model('Voucher', voucherSchema);
