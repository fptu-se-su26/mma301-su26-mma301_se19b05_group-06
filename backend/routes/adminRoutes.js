const express = require('express');
const router = express.Router();
const Voucher = require('../models/Voucher');
const Booking = require('../models/Booking');
const Car = require('../models/Car');
const PricingSurge = require('../models/PricingSurge');

// ─── DYNAMIC PRICING ─────────────────────────────────────────────────────────
// GET /api/analytics/pricing-surges
router.get('/analytics/pricing-surges', async (req, res) => {
  try {
    let surges = await PricingSurge.find({ isActive: true }).populate('car');
    
    // Seed default surges if empty
    if (surges.length === 0) {
      const cars = await Car.find({});
      if (cars.length > 0) {
        const defaultSurges = [
          {
            car: cars[0]._id,
            multiplier: 1.25,
            reason: 'Weekend premium peak demand',
            startDate: '2026-06-01',
            endDate: '2026-06-30'
          },
          {
            car: cars[1]._id,
            multiplier: 1.5,
            reason: 'Holiday traffic rush',
            startDate: '2026-06-15',
            endDate: '2026-06-25'
          }
        ];
        await PricingSurge.insertMany(defaultSurges);
        surges = await PricingSurge.find({ isActive: true }).populate('car');
      }
    }
    res.json(surges);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server khi lấy dữ liệu pricing surges' });
  }
});

// ─── CAR AVAILABILITY ────────────────────────────────────────────────────────
// GET /api/bookings/availability/:carId
router.get('/bookings/availability/:carId', async (req, res) => {
  try {
    let bookings = await Booking.find({ car: req.params.carId });
    
    // Seed default bookings for this car if empty to demonstrate timeline
    if (bookings.length === 0) {
      const today = new Date();
      const nextWeek = new Date(today.getTime() + 7 * 86400000);
      const followingWeek = new Date(today.getTime() + 14 * 86400000);
      
      const defaultBookings = [
        {
          car: req.params.carId,
          startDate: today.toISOString().split('T')[0],
          endDate: new Date(today.getTime() + 3 * 86400000).toISOString().split('T')[0],
          totalPrice: 15000000,
          status: 'Approved',
          notes: 'Regular customer rental'
        },
        {
          car: req.params.carId,
          startDate: nextWeek.toISOString().split('T')[0],
          endDate: new Date(nextWeek.getTime() + 2 * 86400000).toISOString().split('T')[0],
          totalPrice: 10000000,
          status: 'Pending',
          notes: 'Awaiting payment confirmation'
        }
      ];
      await Booking.insertMany(defaultBookings);
      bookings = await Booking.find({ car: req.params.carId });
    }
    res.json(bookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server khi lấy lịch rảnh xe' });
  }
});

// ─── AVAILABILITY CALENDAR ───────────────────────────────────────────────────
// GET /api/bookings/admin/availability
router.get('/bookings/admin/availability', async (req, res) => {
  try {
    const bookings = await Booking.find({}).populate('car');
    const calendarMap = {};
    
    bookings.forEach((b) => {
      let current = new Date(b.startDate);
      const end = new Date(b.endDate);
      while (current <= end) {
        const dateStr = current.toISOString().split('T')[0];
        if (!calendarMap[dateStr]) {
          calendarMap[dateStr] = {
            date: dateStr,
            status: 'available',
            bookingsCount: 0,
            carNames: []
          };
        }
        calendarMap[dateStr].bookingsCount += 1;
        if (b.car) {
          calendarMap[dateStr].carNames.push(`${b.car.brand} ${b.car.model}`);
        }
        calendarMap[dateStr].status = calendarMap[dateStr].bookingsCount > 1 ? 'booked' : 'partial';
        current.setDate(current.getDate() + 1);
      }
    });
    
    res.json(Object.values(calendarMap));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server khi lấy lịch calendar' });
  }
});

// ─── VOUCHER MANAGEMENT ──────────────────────────────────────────────────────
// GET /api/admin/vouchers
router.get('/admin/vouchers', async (req, res) => {
  try {
    const vouchers = await Voucher.find({}).sort({ createdAt: -1 });
    res.json(vouchers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server khi lấy danh sách voucher' });
  }
});

// POST /api/admin/vouchers
router.post('/admin/vouchers', async (req, res) => {
  try {
    const { code, discountType, discountValue, minBookingValue, expiryDate, maxUsage, description } = req.body;
    
    // Check if code already exists
    const existing = await Voucher.findOne({ code: code.toUpperCase() });
    if (existing) {
      return res.status(400).json({ message: 'Mã giảm giá này đã tồn tại.' });
    }
    
    const voucher = new Voucher({
      code: code.toUpperCase(),
      discountType,
      discountValue: Number(discountValue),
      minBookingValue: minBookingValue ? Number(minBookingValue) : 0,
      expiryDate,
      maxUsage: maxUsage ? Number(maxUsage) : undefined,
      description
    });
    
    await voucher.save();
    res.status(201).json({ voucher });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server khi tạo voucher' });
  }
});

// DELETE /api/admin/vouchers/:id
router.delete('/admin/vouchers/:id', async (req, res) => {
  try {
    await Voucher.findByIdAndDelete(req.params.id);
    res.json({ message: 'Xóa voucher thành công' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server khi xóa voucher' });
  }
});

// POST /api/admin/vouchers/apply
router.post('/admin/vouchers/apply', async (req, res) => {
  try {
    const { code, bookingValue } = req.body;
    const voucher = await Voucher.findOne({ code: code.toUpperCase(), isActive: true });
    
    if (!voucher) {
      return res.status(404).json({ message: 'Mã ưu đãi không hợp lệ hoặc đã hết hạn.' });
    }
    
    if (voucher.expiryDate && new Date(voucher.expiryDate) < new Date()) {
      return res.status(400).json({ message: 'Mã ưu đãi đã hết hạn sử dụng.' });
    }
    
    if (voucher.minBookingValue && bookingValue < voucher.minBookingValue) {
      return res.status(400).json({ 
        message: `Mã áp dụng cho đơn hàng tối thiểu ${voucher.minBookingValue.toLocaleString()} VNĐ.` 
      });
    }
    
    if (voucher.maxUsage && voucher.usedCount >= voucher.maxUsage) {
      return res.status(400).json({ message: 'Mã ưu đãi đã hết lượt sử dụng.' });
    }
    
    const discountAmount = voucher.discountType === 'percentage'
      ? bookingValue * (voucher.discountValue / 100)
      : voucher.discountValue;
      
    res.json({
      code: voucher.code,
      discountPercentage: voucher.discountType === 'percentage' ? voucher.discountValue : undefined,
      value: voucher.discountValue,
      discountAmount
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server khi áp dụng voucher' });
  }
});

module.exports = router;
