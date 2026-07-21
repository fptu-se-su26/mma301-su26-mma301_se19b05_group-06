const express = require('express');
const { protect, adminRouteGuard } = require('../middleware/auth');
const {
  getAdminVouchers,
  createAdminVoucher,
  deleteAdminVoucher,
  applyVoucher
} = require('../controllers/voucherController');

const router = express.Router();

// Admin operations
router.get('/', adminRouteGuard, getAdminVouchers);
router.post('/', adminRouteGuard, createAdminVoucher);
router.delete('/:id', adminRouteGuard, deleteAdminVoucher);

// Client operations
router.post('/apply', protect, applyVoucher);

module.exports = router;
