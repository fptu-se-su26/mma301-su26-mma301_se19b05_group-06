const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');
const nodemailer = require('nodemailer');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ─── Token Helpers ────────────────────────────────────────────────────────────
const generateAccessToken = (id, role) =>
  jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '15m' });

const generateRefreshToken = (id) =>
  jwt.sign({ id }, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET + '_refresh', { expiresIn: '30d' });

// ─── Email Helper ─────────────────────────────────────────────────────────────
const sendEmail = async (to, subject, html) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
  });
  await transporter.sendMail({ from: `"LuxeRide" <${process.env.EMAIL_USER}>`, to, subject, html });
};

// ─── REGISTER ─────────────────────────────────────────────────────────────────
// POST /api/auth/register
// Body: { name, email, password }
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString('hex');

    const user = await User.create({
      name, email,
      password: hashedPassword,
      isVerified: false,
      verificationToken
    });

    // Send verification email
    const verifyUrl = `${process.env.FRONTEND_URL || 'http://localhost:5000'}/api/auth/verify-email?token=${verificationToken}`;
    await sendEmail(email, 'Verify your LuxeRide account', `
      <h2>Welcome to LuxeRide, ${name}!</h2>
      <p>Click below to verify your email:</p>
      <a href="${verifyUrl}" style="background:#EAB308;padding:12px 24px;color:#000;text-decoration:none;border-radius:8px">Verify Email</a>
      <p>Link expires in 24 hours.</p>
    `).catch(() => {}); // Non-blocking — don't fail registration if email fails

    res.status(201).json({
      message: 'Registration successful. Please check your email to verify your account.',
      _id: user.id, name: user.name, email: user.email, role: user.role,
      // For development: return token immediately even before verification
      token: generateAccessToken(user.id, user.role),
      isVerified: user.isVerified
    });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

// ─── VERIFY EMAIL ─────────────────────────────────────────────────────────────
// GET /api/auth/verify-email?token=xxx
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;
    const user = await User.findOne({ verificationToken: token });
    if (!user) return res.status(400).json({ message: 'Invalid or expired verification token' });

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    res.json({ message: 'Email verified successfully. You can now log in.' });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

// ─── LOGIN ────────────────────────────────────────────────────────────────────
// POST /api/auth/login
// Body: { email, password }
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    if (user.status === 'Locked') return res.status(403).json({ message: 'Account is locked by admin' });
    if (!(await bcrypt.compare(password, user.password))) return res.status(401).json({ message: 'Invalid credentials' });

    const accessToken = generateAccessToken(user.id, user.role);
    const refreshToken = generateRefreshToken(user.id);

    // Store refresh token
    user.refreshTokens.push(refreshToken);
    await user.save();

    res.json({
      _id: user.id, name: user.name, email: user.email, role: user.role,
      isVerified: user.isVerified,
      token: accessToken,         // Short-lived (15m)
      refreshToken               // Long-lived (30d)
    });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

// ─── REFRESH TOKEN ────────────────────────────────────────────────────────────
// POST /api/auth/refresh-token
// Body: { refreshToken }
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).json({ message: 'Refresh token required' });

    const refreshSecret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET + '_refresh';
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, refreshSecret);
    } catch {
      return res.status(401).json({ message: 'Invalid or expired refresh token' });
    }

    const user = await User.findById(decoded.id);
    if (!user || !user.refreshTokens.includes(refreshToken)) {
      return res.status(401).json({ message: 'Refresh token revoked' });
    }

    const newAccessToken = generateAccessToken(user.id, user.role);
    res.json({ token: newAccessToken });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

// ─── LOGOUT (current device) ─────────────────────────────────────────────────
// POST /api/auth/logout
// Body: { refreshToken }
exports.logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const user = await User.findById(req.user.id);
    if (user) {
      user.refreshTokens = user.refreshTokens.filter(t => t !== refreshToken);
      await user.save();
    }
    res.json({ message: 'Logged out successfully' });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

// ─── LOGOUT ALL DEVICES ───────────────────────────────────────────────────────
// POST /api/auth/logout-all
exports.logoutAll = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.id, { refreshTokens: [] });
    res.json({ message: 'Logged out from all devices' });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

// ─── CHANGE PASSWORD ──────────────────────────────────────────────────────────
// PUT /api/auth/change-password
// Body: { oldPassword, newPassword }
// Header: Authorization: Bearer <token>
exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.isGoogleUser) return res.status(400).json({ message: 'Google users cannot change password' });

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Old password is incorrect' });

    user.password = await bcrypt.hash(newPassword, 10);
    user.refreshTokens = []; // Invalidate all sessions
    await user.save();

    res.json({ message: 'Password changed. Please log in again on all devices.' });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

// ─── GOOGLE LOGIN ─────────────────────────────────────────────────────────────
// POST /api/auth/google
// Body: { credential } — Firebase ID token
exports.googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) return res.status(400).json({ message: 'Missing Google credential' });

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    if (!payload?.email) return res.status(400).json({ message: 'Invalid Google token' });

    let user = await User.findOne({ email: payload.email });
    if (user && user.status === 'Locked') return res.status(403).json({ message: 'Account is locked by admin' });

    if (!user) {
      user = await User.create({
        name: payload.name || payload.given_name || 'Google User',
        email: payload.email,
        password: await bcrypt.hash(crypto.randomBytes(16).toString('hex'), 10),
        isVerified: true,
        isGoogleUser: true
      });
    }

    const accessToken = generateAccessToken(user.id, user.role);
    const refreshToken = generateRefreshToken(user.id);
    user.refreshTokens.push(refreshToken);
    await user.save();

    res.json({
      _id: user.id, name: user.name, email: user.email, role: user.role,
      isVerified: user.isVerified,
      token: accessToken,
      refreshToken
    });
  } catch (error) {
    res.status(500).json({ message: 'Google login failed', error: error.message });
  }
};

// ─── FORGOT PASSWORD ──────────────────────────────────────────────────────────
// POST /api/auth/forgot-password
// Body: { email }
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetPasswordToken = resetCode;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    await sendEmail(email, 'LuxeRide Password Reset Code', `
      <h2>Password Reset</h2>
      <p>Your reset code is:</p>
      <h1 style="color:#EAB308;letter-spacing:8px">${resetCode}</h1>
      <p>Valid for 1 hour. Do not share this code.</p>
    `).catch(() => {});

    res.json({ message: 'Reset code sent to email', resetCode }); // Remove resetCode in production
  } catch (error) { res.status(500).json({ error: error.message }); }
};

// ─── RESET PASSWORD ───────────────────────────────────────────────────────────
// POST /api/auth/reset-password
// Body: { email, code, newPassword }
exports.resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    const user = await User.findOne({
      email,
      resetPasswordToken: code,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) return res.status(400).json({ message: 'Invalid or expired reset code' });

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    user.refreshTokens = []; // Invalidate all sessions
    await user.save();

    res.json({ message: 'Password has been reset. Please log in again.' });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

// ─── ADMIN: User Management ───────────────────────────────────────────────────
exports.getUsers = async (req, res) => {
  try { res.json(await User.find().select('-password -refreshTokens')); }
  catch (error) { res.status(500).json({ error: error.message }); }
};

exports.deleteUser = async (req, res) => {
  try { await User.findByIdAndDelete(req.params.id); res.json({ message: 'User deleted' }); }
  catch (error) { res.status(500).json({ error: error.message }); }
};

exports.toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.status = user.status === 'Active' ? 'Locked' : 'Active';
    await user.save();
    res.json({ _id: user.id, status: user.status });
  } catch (error) { res.status(500).json({ error: error.message }); }
};
