const mongoose = require('mongoose');

const SellerRequestSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fullName: { type: String, required: true },
  idCardImage: { type: String, required: true },
  agreedToTerms: { type: Boolean, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }
}, { timestamps: true });

module.exports = mongoose.model('SellerRequest', SellerRequestSchema);
