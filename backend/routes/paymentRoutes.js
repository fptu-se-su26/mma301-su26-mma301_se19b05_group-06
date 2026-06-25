const express = require('express');
const {
  confirmPayment,
  getPaymentHistory,
  getAllPayments
} = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Protected (User)
router.post('/confirm', protect, confirmPayment);
router.get('/history', protect, getPaymentHistory);

module.exports = router;
