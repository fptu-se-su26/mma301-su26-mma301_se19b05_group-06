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
const { protect } = require('../middleware/auth');

const router = express.Router();

// Public
router.get('/availability', checkAvailability);

// Protected (User)
router.post('/', protect, createBooking);
router.get('/my-bookings', protect, getMyBookings);
router.get('/:id', protect, getBookingById);
router.patch('/:id/cancel', protect, cancelBooking);

module.exports = router;
