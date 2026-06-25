const User = require('../models/User');
const Booking = require('../models/Booking');
const Car = require('../models/Car');

// ─── Dashboard Stats (Admin only) ────────────────────────────────────────────
exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ status: 'Active' });
    
    const totalCars = await Car.countDocuments();
    const totalBookings = await Booking.countDocuments();
    
    // Revenue from paid bookings
    const revenueData = await Booking.aggregate([
      { $match: { paymentStatus: 'paid' } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalPrice' }
        }
      }
    ]);
    
    const revenue = revenueData.length > 0 ? revenueData[0].totalRevenue : 0;
    
    // Completed bookings this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const monthlyBookings = await Booking.countDocuments({
      createdAt: { $gte: startOfMonth },
      status: 'Completed'
    });
    
    res.json({
      totalUsers,
      activeUsers,
      totalCars,
      totalBookings,
      revenue: Math.round(revenue),
      monthlyBookings
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─── Booking Statistics ──────────────────────────────────────────────────────
exports.getBookingStatistics = async (req, res) => {
  try {
    const totalBookings = await Booking.countDocuments();
    
    // Bookings by status
    const bookingsByStatus = await Booking.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const statusMap = {};
    bookingsByStatus.forEach(item => {
      const key = item._id || 'Unknown';
      statusMap[key] = item.count;
    });
    
    // Revenue data
    const revenueData = await Booking.aggregate([
      { $match: { paymentStatus: 'paid' } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalPrice' }
        }
      }
    ]);
    
    const totalRevenue = revenueData.length > 0 ? revenueData[0].totalRevenue : 0;
    
    // Monthly revenue
    const monthlyRevenue = await Booking.aggregate([
      { $match: { paymentStatus: 'paid' } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          revenue: { $sum: '$totalPrice' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]);
    
    res.json({
      totalBookings,
      bookingsByStatus: statusMap,
      totalRevenue: Math.round(totalRevenue),
      monthlyRevenue
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─── Analytics by Period ────────────────────────────────────────────────────
exports.getAnalytics = async (req, res) => {
  try {
    const { period = 'month' } = req.query; // day, month, year
    
    const now = new Date();
    let startDate = new Date();
    
    if (period === 'day') {
      startDate.setDate(startDate.getDate() - 1);
    } else if (period === 'month') {
      startDate.setMonth(startDate.getMonth() - 1);
    } else if (period === 'year') {
      startDate.setFullYear(startDate.getFullYear() - 1);
    }
    
    const bookings = await Booking.find({
      createdAt: { $gte: startDate, $lte: now }
    }).lean();
    
    const paidBookings = bookings.filter(b => b.paymentStatus === 'paid');
    const totalRevenue = paidBookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
    
    res.json({
      period,
      startDate,
      endDate: now,
      totalBookings: bookings.length,
      paidBookings: paidBookings.length,
      totalRevenue: Math.round(totalRevenue),
      averageBookingValue: bookings.length > 0 ? Math.round(totalRevenue / bookings.length) : 0
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─── Pricing Surge Analytics ────────────────────────────────────────────────
exports.getPricingSurges = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('carId', 'brand model pricePerDay')
      .lean();
    const now = new Date();

    const surgeData = bookings
      .map((booking) => {
        const rawDate = booking.startDate || booking.pickupDate;
        if (!rawDate) return null;

        const startDate = new Date(rawDate);
        if (Number.isNaN(startDate.getTime())) return null;

        const carRef = booking.carId;
        const snapshot = booking.carSnapshot || {};
        const returnDate = booking.endDate || booking.returnDate;
        const rentalDays = returnDate
          ? Math.max(1, Math.ceil((new Date(returnDate) - startDate) / (1000 * 60 * 60 * 24)))
          : 1;
        const pricePerDay = booking.pricePerDay
          || carRef?.pricePerDay
          || snapshot.pricePerDay
          || (booking.totalPrice ? Math.round(booking.totalPrice / rentalDays) : 0);

        const daysFromNow = Math.floor((startDate - now) / (1000 * 60 * 60 * 24));
        let surgeMultiplier = 1.0;

        if (daysFromNow <= 3 && daysFromNow >= 0) surgeMultiplier = 1.3;
        if (startDate.getDay() === 6 || startDate.getDay() === 0) {
          surgeMultiplier = Math.max(surgeMultiplier, 1.2);
        }

        const carName = [snapshot.brand || carRef?.brand, snapshot.model || carRef?.model]
          .filter(Boolean)
          .join(' ')
          .trim() || snapshot.name || 'Unknown Vehicle';

        return {
          carId: carRef?._id || booking.car || booking.carId,
          carName,
          date: startDate.toISOString(),
          surgeMultiplier,
          basePrice: pricePerDay,
          dynamicPrice: Math.round(pricePerDay * surgeMultiplier),
          reason: daysFromNow <= 3 ? 'Last-minute demand' : 'Peak period'
        };
      })
      .filter(Boolean);

    res.json(surgeData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─── All Bookings (Admin) ───────────────────────────────────────────────────
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('userId', 'name email')
      .populate('carId', 'name model brand')
      .sort({ createdAt: -1 })
      .lean();
    
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
