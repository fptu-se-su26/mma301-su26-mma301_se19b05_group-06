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
  confirmPayment,
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
router.put('/bookings/:id/status', adminRouteGuard, (req, res) => {
  res.status(403).json({ message: 'Admin is read-only for booking updates' });
});
router.patch('/bookings/:id/complete', adminRouteGuard, (req, res) => {
  res.status(403).json({ message: 'Admin is read-only for booking completion' });
});
router.delete('/bookings/:id', adminRouteGuard, (req, res) => {
  res.status(403).json({ message: 'Admin is read-only for booking deletion' });
});

// ═══════════════════════════════════════════════════════════════════════════════
// PAYMENT MANAGEMENT (Admin Only)
// ═══════════════════════════════════════════════════════════════════════════════
router.post('/payments/confirm', adminRouteGuard, confirmPayment);
router.get('/payments', adminRouteGuard, getAllPayments);

// ═══════════════════════════════════════════════════════════════════════════════
// SELLER REQUESTS (Admin + User)
// ═══════════════════════════════════════════════════════════════════════════════
router.post('/seller-requests', protect, submitSellerRequest);
router.get('/seller-requests', adminRouteGuard, getSellerRequests);
router.patch('/seller-requests/:id/approve', adminRouteGuard, approveSellerRequest);
router.patch('/seller-requests/:id/decline', adminRouteGuard, declineSellerRequest);

module.exports = router;
