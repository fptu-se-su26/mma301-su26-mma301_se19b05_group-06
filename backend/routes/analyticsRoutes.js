const express = require('express');
const {
  getDashboardStats,
  getBookingStatistics,
  getAnalytics,
  getPricingSurges,
  getAllBookings
} = require('../controllers/analyticsController');
const {
  updateBookingStatus,
  completeBooking,
  deleteBooking
} = require('../controllers/bookingController');
const {
  confirmPayment,
  getAllPayments
} = require('../controllers/paymentController');
const { adminRouteGuard } = require('../middleware/auth');

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
router.post('/payments/confirm', adminRouteGuard, confirmPayment);
router.get('/payments', adminRouteGuard, getAllPayments);

module.exports = router;
