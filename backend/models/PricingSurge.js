const mongoose = require('mongoose');

const pricingSurgeSchema = new mongoose.Schema({
  car: { type: mongoose.Schema.Types.ObjectId, ref: 'Car', required: true },
  multiplier: { type: Number, required: true },
  reason: { type: String, required: true },
  startDate: { type: String, required: true }, // YYYY-MM-DD
  endDate: { type: String, required: true }, // YYYY-MM-DD
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.models.PricingSurge || mongoose.model('PricingSurge', pricingSurgeSchema);
