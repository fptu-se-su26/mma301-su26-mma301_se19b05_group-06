const Booking = require('../models/Booking');
const User = require('../models/User');
const Car = require('../models/Car');

// ─── Create Booking ──────────────────────────────────────────────────────────
exports.createBooking = async (req, res) => {
  try {
    const {
      carId, car,
      startDate, pickupDate,
      endDate, returnDate,
      pickupLocation, dropoffLocation,
      notes, note,
      customerName, customerPhone, customerEmail,
      paymentMethod,
      promoCode
    } = req.body;
    
    const actualCarId = carId || car;
    const actualStartDate = startDate || pickupDate;
    const actualEndDate = endDate || returnDate;
    const actualNotes = notes || note;
    
    const carDoc = await Car.findById(actualCarId);
    if (!carDoc) return res.status(404).json({ message: 'Car not found' });
    
    const start = new Date(actualStartDate);
    const end = new Date(actualEndDate);
    const numberOfDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    
    if (numberOfDays <= 0) {
      return res.status(400).json({ message: 'Invalid date range' });
    }
    
    let totalPrice = carDoc.pricePerDay * numberOfDays;
    
    if (promoCode) {
      const codeUpper = promoCode.trim().toUpperCase();
      let discountAmount = 0;
      if (codeUpper === 'ELITE15' || codeUpper === 'SUMMER2026' || codeUpper === 'SUMMER15') {
        discountAmount = totalPrice * 0.15;
      } else if (codeUpper === 'WELCOME' || codeUpper === 'FPTU' || codeUpper === 'NEWUSER10') {
        discountAmount = totalPrice * 0.10;
      } else if (codeUpper === 'SVJ30') {
        discountAmount = totalPrice * 0.30;
      } else if (codeUpper === 'DAYGOOD') {
        discountAmount = totalPrice * 0.20;
      } else if (codeUpper === 'NEWUSER20') {
        discountAmount = totalPrice * 0.20;
      } else if (codeUpper === 'VIP500K') {
        discountAmount = 500000;
      }
      totalPrice = Math.max(0, totalPrice - discountAmount);
    }
    
    // Fetch user info for fallbacks if not provided
    let finalCustomerName = customerName;
    let finalCustomerEmail = customerEmail;
    if (!finalCustomerName || !finalCustomerEmail) {
      const user = await User.findById(req.user.id);
      if (user) {
        if (!finalCustomerName) finalCustomerName = user.name;
        if (!finalCustomerEmail) finalCustomerEmail = user.email;
      }
    }
    
    const booking = new Booking({
      carId: actualCarId,
      car: actualCarId,
      userId: req.user.id,
      startDate: start,
      endDate: end,
      pickupDate: start,
      returnDate: end,
      pricePerDay: carDoc.pricePerDay,
      numberOfDays,
      totalPrice,
      pickupLocation: pickupLocation || 'Hub',
      dropoffLocation: dropoffLocation || 'Hub',
      notes: actualNotes,
      note: actualNotes,
      customerName: finalCustomerName,
      customerPhone: customerPhone || '',
      customerEmail: finalCustomerEmail,
      paymentMethod: 'bank_transfer',  // Chỉ hỗ trợ chuyển khoản online
      status: 'Pending',               // Luôn Pending cho đến khi xác nhận chuyển khoản
      paymentStatus: 'pending'         // Luôn pending — gọi /payments/confirm sau khi CK
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
    let bookings = await Booking.find({ userId: req.user.id })
      .populate('carId')
      .populate('car')
      .sort({ createdAt: -1 });
    
    // Kiểm tra trạng thái thanh toán từ PayOS
    const { checkAndUpdatePaymentStatus } = require('./paymentController');
    bookings = await Promise.all(bookings.map(async (booking) => {
      if (booking.status === 'Pending' && booking.orderCode) {
        return await checkAndUpdatePaymentStatus(booking);
      }
      return booking;
    }));
    
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─── Get Booking by ID ──────────────────────────────────────────────────────
exports.getBookingById = async (req, res) => {
  try {
    let booking = await Booking.findById(req.params.id)
      .populate('carId')
      .populate('car')
      .populate('userId', 'name email');
    
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    
    // Check permission
    if (booking.userId._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Kiểm tra trạng thái thanh toán từ PayOS
    if (booking.status === 'Pending' && booking.orderCode) {
      const { checkAndUpdatePaymentStatus } = require('./paymentController');
      booking = await checkAndUpdatePaymentStatus(booking);
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
    
    // Check permission
    const bookingUser = booking.userId || booking.user;
    if (!bookingUser) {
      return res.status(400).json({ message: 'Booking has no user owner reference' });
    }
    if (bookingUser.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to cancel this booking' });
    }
    
    if (booking.status === 'Completed' || booking.status === 'Cancelled') {
      return res.status(400).json({ message: 'Cannot cancel a ' + booking.status.toLowerCase() + ' booking' });
    }
    
    booking.status = 'Cancelled';
    booking.paymentStatus = 'refunded';
    booking.updatedAt = new Date();
    
    await booking.save();
    
    res.json({ message: 'Booking cancelled successfully', booking });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─── Delete Booking (Owner or Admin) ─────────────────────────────────────────
exports.deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    // Chỉ owner hoặc admin mới được xóa
    const ownerId = (booking.userId || booking.user)?.toString();
    if (ownerId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this booking' });
    }

    // Chỉ cho phép xóa booking đã Completed hoặc Cancelled
    if (!['Completed', 'Cancelled'].includes(booking.status)) {
      return res.status(400).json({ message: 'Only completed or cancelled bookings can be deleted' });
    }

    await Booking.findByIdAndDelete(req.params.id);
    res.json({ message: 'Booking deleted successfully' });
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

// ─── Extend Booking ──────────────────────────────────────────────────────────
exports.extendBooking = async (req, res) => {
  try {
    const { newReturnDate } = req.body;
    const booking = await Booking.findById(req.params.id).populate('carId');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    // Check permission
    const bookingUser = booking.userId || booking.user;
    if (!bookingUser) {
       return res.status(400).json({ message: 'Booking has no user owner reference' });
    }
    if (bookingUser.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Only allow extending Pending or Approved bookings
    if (!['Pending', 'Approved', 'Confirmed'].includes(booking.status)) {
      return res.status(400).json({ message: 'Cannot extend a ' + booking.status.toLowerCase() + ' booking' });
    }

    const currentEnd = new Date(booking.endDate);
    const newEnd = new Date(newReturnDate);

    if (newEnd <= currentEnd) {
      return res.status(400).json({ message: 'New return date must be after current end date' });
    }

    // Check for conflicting bookings
    const conflicting = await Booking.findOne({
      carId: booking.carId._id || booking.carId,
      _id: { $ne: booking._id },
      status: { $ne: 'Cancelled' },
      startDate: { $lt: newEnd },
      endDate: { $gt: currentEnd }
    });

    if (conflicting) {
      return res.status(409).json({ message: 'Conflicting booking exists for extended dates' });
    }

    const extraDays = Math.ceil((newEnd - currentEnd) / (1000 * 60 * 60 * 24));
    const addedFee = booking.pricePerDay * extraDays;

    // Khởi tạo PayOS
    const { PayOS } = require('@payos/node');
    const payos = new PayOS({
      clientId: process.env.PAYOS_CLIENT_ID,
      apiKey: process.env.PAYOS_API_KEY,
      checksumKey: process.env.PAYOS_CHECKSUM_KEY
    });

    const orderCode = Number(String(Date.now()).slice(-6) + Math.floor(Math.random() * 1000));

    // Lưu thông tin gia hạn tạm thời chờ thanh toán
    booking.pendingExtension = {
      newEndDate: newEnd,
      extraDays: extraDays,
      addedFee: addedFee,
      orderCode: orderCode
    };
    await booking.save();

    const YOUR_DOMAIN = 'luxeride://bookings'; // Expo Deep Link

    const body = {
      orderCode: orderCode,
      amount: addedFee,
      description: `Gia han don ${booking._id.toString().slice(-4)}`,
      returnUrl: YOUR_DOMAIN, // Chuyển về app sau khi thanh toán
      cancelUrl: YOUR_DOMAIN,
    };

    const paymentLinkRes = await payos.paymentRequests.create(body);

    res.json({
      success: true,
      message: 'Tạo link thanh toán gia hạn thành công',
      checkoutUrl: paymentLinkRes.checkoutUrl,
      addedFee,
      extraDays
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
