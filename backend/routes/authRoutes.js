const express = require('express');
const {
  register, login, googleLogin,
  verifyEmail, refreshToken, logout, logoutAll,
  changePassword, forgotPassword, resetPassword,
  getUsers, deleteUser, toggleUserStatus
} = require('../controllers/authController');
const { protect, adminOnly } = require('../middleware/auth');
const router = express.Router();

// Public
router.post('/register', register);
router.get('/verify-email', verifyEmail);           // GET /api/auth/verify-email?token=xxx
router.post('/login', login);
router.post('/google', googleLogin);
router.post('/refresh-token', refreshToken);         // POST /api/auth/refresh-token
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Protected
router.post('/logout', protect, logout);             // POST /api/auth/logout
router.post('/logout-all', protect, logoutAll);      // POST /api/auth/logout-all
router.put('/change-password', protect, changePassword); // PUT /api/auth/change-password

// Admin
router.get('/users', protect, adminOnly, getUsers);
router.delete('/users/:id', protect, adminOnly, deleteUser);
router.put('/users/:id/status', protect, adminOnly, toggleUserStatus);

module.exports = router;
