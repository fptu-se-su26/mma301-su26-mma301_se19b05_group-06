const Booking = require('../models/Booking');

// ─── Confirm Payment ────────────────────────────────────────────────────────
exports.confirmPayment = async (req, res) => {
  try {
    const { bookingId } = req.body;
    
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    
    // Check permission
    if (booking.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    if (booking.paymentStatus === 'paid') {
      return res.status(400).json({ message: 'Payment already confirmed' });
    }
    
    // Update booking status
    booking.paymentStatus = 'paid';
    booking.status = 'Approved';
    booking.updatedAt = new Date();
    
    await booking.save();
    
    res.json({
      message: 'Payment confirmed successfully',
      booking,
      paymentId: 'PAY_' + booking._id + '_' + Date.now(),
      transactionDate: new Date()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─── Get Payment History ────────────────────────────────────────────────────
exports.getPaymentHistory = async (req, res) => {
  try {
    const payments = await Booking.find({
      userId: req.user.id,
      paymentStatus: 'paid'
    })
      .populate('carId', 'name model brand')
      .sort({ createdAt: -1 });
    
    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─── Get All Payments (Admin) ───────────────────────────────────────────────
exports.getAllPayments = async (req, res) => {
  try {
    const payments = await Booking.find({ paymentStatus: 'paid' })
      .populate('userId', 'name email')
      .populate('carId', 'name model brand')
      .sort({ updatedAt: -1 });
    
    const totalRevenue = payments.reduce((sum, p) => sum + (p.totalPrice || 0), 0);
    
    res.json({
      totalPayments: payments.length,
      totalRevenue: Math.round(totalRevenue),
      payments
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
