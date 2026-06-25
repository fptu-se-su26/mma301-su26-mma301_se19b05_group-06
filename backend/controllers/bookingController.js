const Booking = require('../models/Booking');
const User = require('../models/User');
const Car = require('../models/Car');

// ─── Create Booking ──────────────────────────────────────────────────────────
exports.createBooking = async (req, res) => {
  try {
    const { carId, startDate, endDate, pickupLocation, dropoffLocation, notes } = req.body;
    
    const car = await Car.findById(carId);
    if (!car) return res.status(404).json({ message: 'Car not found' });
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    const numberOfDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    
    if (numberOfDays <= 0) {
      return res.status(400).json({ message: 'Invalid date range' });
    }
    
    const totalPrice = car.pricePerDay * numberOfDays;
    
    const booking = new Booking({
      carId,
      userId: req.user.id,
      startDate: start,
      endDate: end,
      pricePerDay: car.pricePerDay,
      numberOfDays,
      totalPrice,
      pickupLocation,
      dropoffLocation,
      notes,
      status: 'Pending'
    });
    
    await booking.save();
    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─── Get My Bookings ────────────────────────────────────────────────────────
exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user.id })
      .populate('carId')
      .sort({ createdAt: -1 });
    
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─── Get Booking by ID ──────────────────────────────────────────────────────
exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('carId')
      .populate('userId', 'name email');
    
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    
    // Check permission
    if (booking.userId._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    res.json(booking);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─── Update Booking Status (Admin) ──────────────────────────────────────────
exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status, updatedAt: new Date() },
      { new: true }
    ).populate('carId').populate('userId', 'name email');
    
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    
    res.json(booking);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─── Complete Booking (Admin) ───────────────────────────────────────────────
exports.completeBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    
    // Calculate late fee if applicable
    const returnDate = new Date();
    const endDate = new Date(booking.endDate);
    const daysLate = Math.max(0, Math.ceil((returnDate - endDate) / (1000 * 60 * 60 * 24)));
    
    let lateFee = 0;
    if (daysLate > 0) {
      // Late fee: 50% of daily rate per day late
      lateFee = Math.round(booking.pricePerDay * 0.5 * daysLate);
    }
    
    booking.status = 'Completed';
    booking.lateFee = lateFee;
    booking.totalPrice = booking.totalPrice + lateFee;
    booking.updatedAt = new Date();
    
    await booking.save();
    
    res.json({
      message: 'Booking completed',
      booking,
      lateFee,
      totalPrice: booking.totalPrice
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─── Cancel Booking ────────────────────────────────────────────────────────
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    
    if (booking.status === 'Completed' || booking.status === 'Cancelled') {
      return res.status(400).json({ message: 'Cannot cancel a ' + booking.status.toLowerCase() + ' booking' });
    }
    
    booking.status = 'Cancelled';
    booking.paymentStatus = 'refunded';
    booking.updatedAt = new Date();
    
    await booking.save();
    
    res.json({ message: 'Booking cancelled', booking });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─── Delete Booking (Admin) ────────────────────────────────────────────────
exports.deleteBooking = async (req, res) => {
  try {
    await Booking.findByIdAndDelete(req.params.id);
    res.json({ message: 'Booking deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─── Check Availability ────────────────────────────────────────────────────
exports.checkAvailability = async (req, res) => {
  try {
    const { carId, startDate, endDate } = req.query;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const conflicting = await Booking.findOne({
      carId,
      $or: [
        { startDate: { $lt: end }, endDate: { $gt: start } }
      ],
      status: { $ne: 'Cancelled' }
    });
    
    res.json({
      available: !conflicting,
      conflictingBooking: conflicting || null
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
