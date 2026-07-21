const Voucher = require('../models/Voucher');

exports.getAdminVouchers = async (req, res) => {
  try {
    const vouchers = await Voucher.find().sort({ createdAt: -1 });
    res.json(vouchers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createAdminVoucher = async (req, res) => {
  try {
    const voucherData = req.body;
    if (voucherData.code) {
      voucherData.code = voucherData.code.toUpperCase().trim();
    }
    const voucher = new Voucher(voucherData);
    await voucher.save();
    res.status(201).json({ voucher });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteAdminVoucher = async (req, res) => {
  try {
    await Voucher.findByIdAndDelete(req.params.id);
    res.json({ message: 'Voucher deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.applyVoucher = async (req, res) => {
  try {
    const { code, bookingValue } = req.body;
    if (!code) {
      return res.status(400).json({ message: 'Please provide a voucher code' });
    }

    const voucher = await Voucher.findOne({ code: code.toUpperCase().trim() });
    if (!voucher) {
      return res.status(404).json({ message: 'Invalid voucher code' });
    }

    if (!voucher.isActive) {
      return res.status(400).json({ message: 'This voucher has been deactivated' });
    }

    if (voucher.expiryDate && new Date(voucher.expiryDate) < new Date()) {
      return res.status(400).json({ message: 'This voucher has expired' });
    }

    if (voucher.maxUsage && voucher.usedCount >= voucher.maxUsage) {
      return res.status(400).json({ message: 'This voucher has reached its maximum usage limit' });
    }

    if (bookingValue < voucher.minBookingValue) {
      return res.status(400).json({ 
        message: `This voucher only applies to bookings with a minimum value of ${voucher.minBookingValue.toLocaleString()} VNĐ` 
      });
    }

    // Calculate discount value
    let discountPercentage = 0;
    let value = 0;

    if (voucher.discountType === 'percentage') {
      discountPercentage = voucher.discountValue;
      value = Math.round((bookingValue * discountPercentage) / 100);
    } else {
      value = voucher.discountValue;
      discountPercentage = Math.round((value / bookingValue) * 100);
    }

    res.json({
      discountPercentage,
      value,
      discountType: voucher.discountType,
      code: voucher.code,
      message: 'Voucher applied successfully!'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
