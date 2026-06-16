const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'customer'], default: 'customer' },
  status: { type: String, enum: ['Active', 'Locked'], default: 'Active' },

  // Email Verification
  isVerified: { type: Boolean, default: false },
  verificationToken: { type: String },

  // Refresh Tokens (supports multiple devices)
  refreshTokens: [{ type: String }],

  // Password Reset
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },

  // Google OAuth (no password required)
  isGoogleUser: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
