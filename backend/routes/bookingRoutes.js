const express = require('express');
const {
  createBooking,
  getMyBookings,
  getBookingById,
  updateBookingStatus,
  completeBooking,
  cancelBooking,
  deleteBooking,
  checkAvailability
} = require('../controllers/bookingController');
const { protect, adminReadOnlyGuard } = require('../middleware/auth');

const router = express.Router();

// Public
router.get('/availability', checkAvailability);

// Protected (User)
router.post('/', protect, adminReadOnlyGuard, createBooking);
router.get('/my-bookings', protect, getMyBookings);
router.get('/:id', protect, getBookingById);
router.patch('/:id/cancel', protect, adminReadOnlyGuard, cancelBooking);

module.exports = router;
