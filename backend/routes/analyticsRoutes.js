const express = require('express');
const {
  getDashboardStats,
  getBookingStatistics,
  getAnalytics,
  getPricingSurges,
  getAllBookings
} = require('../controllers/analyticsController');
const {
  submitSellerRequest,
  getSellerRequests,
  approveSellerRequest,
  declineSellerRequest
} = require('../controllers/sellerRequestController');
const {
  updateBookingStatus,
  completeBooking,
  deleteBooking
} = require('../controllers/bookingController');
const {
  getAllPayments
} = require('../controllers/paymentController');
const { adminRouteGuard, protect } = require('../middleware/auth');

const router = express.Router();

// ═══════════════════════════════════════════════════════════════════════════════
// ANALYTICS & STATISTICS (Admin Only)
// ═══════════════════════════════════════════════════════════════════════════════
router.get('/stats', adminRouteGuard, getDashboardStats);
router.get('/booking-statistics', adminRouteGuard, getBookingStatistics);
router.get('/analytics', adminRouteGuard, getAnalytics);
router.get('/pricing-surges', adminRouteGuard, getPricingSurges);

// ═══════════════════════════════════════════════════════════════════════════════
// BOOKING MANAGEMENT (Admin Only)
// ═══════════════════════════════════════════════════════════════════════════════
router.get('/bookings', adminRouteGuard, getAllBookings);
router.put('/bookings/:id/status', adminRouteGuard, updateBookingStatus);
router.patch('/bookings/:id/complete', adminRouteGuard, completeBooking);
router.delete('/bookings/:id', adminRouteGuard, deleteBooking);

// ═══════════════════════════════════════════════════════════════════════════════
// PAYMENT MANAGEMENT (Admin Only)
// ═══════════════════════════════════════════════════════════════════════════════
router.get('/payments', adminRouteGuard, getAllPayments);

// ═══════════════════════════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════════════════════
// SELLER REQUESTS (Admin + User)
// ═══════════════════════════════════════════════════════════════════════════════
router.post('/seller-requests', protect, submitSellerRequest);
router.get('/seller-requests', adminRouteGuard, getSellerRequests);
router.patch('/seller-requests/:id/approve', adminRouteGuard, approveSellerRequest);
router.patch('/seller-requests/:id/decline', adminRouteGuard, declineSellerRequest);

// ═══════════════════════════════════════════════════════════════════════════════
// VOUCHER MANAGEMENT (Seller Only for Write, Seller/Admin for Read)
// ═══════════════════════════════════════════════════════════════════════════════
const Voucher = require('../models/Voucher');
const Car = require('../models/Car');
const { sellerOrAdminRouteGuard } = require('../middleware/auth');

router.post('/vouchers/apply', protect, async (req, res) => {
  try {
    const { code, bookingValue, carId } = req.body;
    const voucher = await Voucher.findOne({ code: code.toUpperCase(), isActive: true });
    if (!voucher) {
      return res.status(404).json({ message: 'Mã giảm giá không hợp lệ hoặc đã hết hạn' });
    }
    if (voucher.expiryDate && new Date(voucher.expiryDate) < new Date()) {
      return res.status(400).json({ message: 'Mã giảm giá đã hết hạn' });
    }
    if (voucher.maxUsage && voucher.usedCount >= voucher.maxUsage) {
      return res.status(400).json({ message: 'Mã giảm giá đã hết lượt sử dụng' });
    }
    if (voucher.minBookingValue && bookingValue < voucher.minBookingValue) {
      return res.status(400).json({ message: `Mã giảm giá chỉ áp dụng cho đơn từ ${voucher.minBookingValue.toLocaleString()} VNĐ` });
    }
    if (carId) {
      const car = await Car.findById(carId);
      if (!car) {
        return res.status(404).json({ message: 'Không tìm thấy thông tin xe' });
      }
      if (car.sellerId && car.sellerId.toString() !== voucher.sellerId.toString()) {
        return res.status(403).json({ message: 'Mã giảm giá này chỉ áp dụng cho các xe của đúng seller đó' });
      }
    }
    res.json({
      success: true,
      discountPercentage: voucher.discountType === 'percentage' ? voucher.discountValue : 0,
      value: voucher.discountType === 'fixed' ? voucher.discountValue : 0,
      discountType: voucher.discountType
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/vouchers', protect, sellerOrAdminRouteGuard, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'seller') {
      query.sellerId = req.user.id;
    }
    const vouchers = await Voucher.find(query).sort({ createdAt: -1 });
    res.json(vouchers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/vouchers', protect, sellerOrAdminRouteGuard, async (req, res) => {
  try {
    if (req.user.role === 'admin') {
      return res.status(403).json({ message: 'Admin không được phép thêm mã giảm giá' });
    }
    const { code, discountType, discountValue, minBookingValue, expiryDate, maxUsage, description } = req.body;
    const existing = await Voucher.findOne({ code: code.toUpperCase() });
    if (existing) {
      return res.status(400).json({ message: 'Mã giảm giá này đã tồn tại' });
    }
    const voucher = new Voucher({
      code: code.toUpperCase(),
      discountType,
      discountValue,
      minBookingValue: minBookingValue || 0,
      expiryDate,
      maxUsage: maxUsage || 100,
      description,
      sellerId: req.user.id
    });
    await voucher.save();
    res.status(201).json(voucher);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/vouchers/:id', protect, sellerOrAdminRouteGuard, async (req, res) => {
  try {
    const voucher = await Voucher.findById(req.params.id);
    if (!voucher) return res.status(404).json({ message: 'Voucher not found' });
    if (req.user.role === 'seller' && voucher.sellerId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Bạn chỉ có quyền xóa mã giảm giá của chính mình' });
    }
    await Voucher.findByIdAndDelete(req.params.id);
    res.json({ message: 'Voucher deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
