const express = require('express');
const { createPaymentLink, payosWebhook, getPaymentHistory, getAllPayments } = require('../controllers/paymentController');
const { protect, adminOnly } = require('../middleware/auth');
const router = express.Router();

// Tạo payment link (cần đăng nhập)
router.post('/create-link', protect, createPaymentLink);

// Webhook từ PayOS gọi về (public)
router.post('/payos-webhook', payosWebhook);

// Các API lấy lịch sử nếu có
if (getPaymentHistory) {
  router.get('/history', protect, getPaymentHistory);
}
if (getAllPayments) {
  router.get('/', protect, adminOnly, getAllPayments);
}

module.exports = router;
