const Booking = require('../models/Booking');
const nodemailer = require('nodemailer');
const { PayOS } = require('@payos/node');

const payos = new PayOS({
  clientId: process.env.PAYOS_CLIENT_ID,
  apiKey: process.env.PAYOS_API_KEY,
  checksumKey: process.env.PAYOS_CHECKSUM_KEY
});

// Helper kiểm tra và cập nhật trạng thái thanh toán từ PayOS
exports.checkAndUpdatePaymentStatus = async (booking) => {
  if (!booking) return booking;

  // 1. Kiểm tra gia hạn trước (nếu có)
  if (booking.pendingExtension && booking.pendingExtension.orderCode) {
    try {
      const paymentLinkInfo = await payos.paymentRequests.get(booking.pendingExtension.orderCode);
      if (paymentLinkInfo && paymentLinkInfo.status === 'PAID') {
        booking.endDate = booking.pendingExtension.newEndDate;
        booking.numberOfDays = booking.numberOfDays + booking.pendingExtension.extraDays;
        booking.totalPrice = booking.totalPrice + booking.pendingExtension.addedFee;
        booking.transactionId = paymentLinkInfo.transactions?.[0]?.reference || ('EXT_' + Date.now());
        booking.pendingExtension = undefined; // Xóa gia hạn chờ
        await booking.save();
        
        try {
          await sendConfirmationEmail(booking);
        } catch (mailErr) {
          console.log('Lỗi gửi mail sau khi cập nhật gia hạn tự động:', mailErr.message);
        }
      }
    } catch (err) {
      console.error(`Lỗi check status gia hạn cho orderCode ${booking.pendingExtension.orderCode}:`, err.message);
    }
  }

  // 2. Kiểm tra thanh toán gốc
  if (booking.orderCode && (booking.status === 'Pending' || booking.paymentStatus === 'pending')) {
    try {
      const paymentLinkInfo = await payos.paymentRequests.get(booking.orderCode);
      if (paymentLinkInfo && paymentLinkInfo.status === 'PAID') {
        booking.paymentStatus = 'paid';
        booking.status = 'Approved';
        booking.transactionId = paymentLinkInfo.transactions?.[0]?.reference || ('MB_' + Date.now());
        await booking.save();
        
        try {
          await sendConfirmationEmail(booking);
        } catch (mailErr) {
          console.log('Lỗi gửi mail sau khi cập nhật tự động:', mailErr.message);
        }
      }
    } catch (err) {
      console.error(`Lỗi check status PayOS cho orderCode ${booking.orderCode}:`, err.message);
    }
  }
  return booking;
};

// Helper gửi email
const sendConfirmationEmail = async (booking) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER || 'your-email@gmail.com',
        pass: process.env.EMAIL_PASS || 'your-app-password'
      }
    });

    const mailOptions = {
      from: '"LuxeRide Vehicles" <no-reply@luxeride.com>',
      to: booking.customerEmail || 'demo@example.com',
      subject: `[LuxeRide] Phiếu Thuê Xe (Rental Ticket) - ${booking.transactionId}`,
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #f8f9fa; padding: 30px;">
          <div style="background-color: #fff; border-top: 5px solid #d4af37; padding: 30px; border-radius: 8px; max-width: 600px; margin: 0 auto; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
            <h1 style="color: #333; margin-top: 0;">PHIẾU THUÊ XE / RENTAL TICKET</h1>
            <p style="color: #28a745; font-weight: bold; font-size: 16px;">✓ Thanh toán thành công (Payment Confirmed)</p>
            
            <p>Xin chào <strong>${booking.customerName}</strong>,</p>
            <p>Cảm ơn bạn đã tin tưởng dịch vụ của chúng tôi. Chuyến đi của bạn đã được xác nhận (Mã Booking: <strong>${booking._id}</strong>).</p>
            
            <h3 style="border-bottom: 2px solid #eee; padding-bottom: 10px; color: #d4af37;">THÔNG TIN KHÁCH HÀNG</h3>
            <ul>
              <li><strong>Họ Tên:</strong> ${booking.customerName}</li>
              <li><strong>SĐT:</strong> ${booking.customerPhone}</li>
              <li><strong>Email:</strong> ${booking.customerEmail}</li>
            </ul>

            <h3 style="border-bottom: 2px solid #eee; padding-bottom: 10px; color: #d4af37;">CHI TIẾT CHUYẾN ĐI (TRIP DETAILS)</h3>
            <ul>
              <li><strong>Xe (Car):</strong> ${booking.car ? booking.car.brand + ' ' + booking.car.model : 'LuxeRide Vehicle'}</li>
              <li><strong>Ngày Nhận (Pickup):</strong> ${booking.pickupDate ? booking.pickupDate.toISOString().split('T')[0] : ''}</li>
              <li><strong>Ngày Trả (Return):</strong> ${booking.returnDate ? booking.returnDate.toISOString().split('T')[0] : ''}</li>
              <li><strong>Ghi chú / Items:</strong> ${booking.note || 'Không có'}</li>
            </ul>

            <h3 style="border-bottom: 2px solid #eee; padding-bottom: 10px; color: #d4af37;">THANH TOÁN (PAYMENT)</h3>
            <p><strong>Tổng tiền:</strong> ${booking.totalPrice?.toLocaleString()} VNĐ</p>
            <p><strong>Mã giao dịch (Txn ID):</strong> ${booking.transactionId}</p>
            
            <br/>
            <p style="color: #777; font-size: 13px;">Thư này được gửi tự động. Vui lòng không trả lời. Chúc bạn một chuyến đi tuyệt vời!</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
  } catch (err) {
    console.log('Email warning (Requires valid Gmail + App Password in .env):', err.message);
  }
};

exports.createPaymentLink = async (req, res) => {
  try {
    const { bookingId } = req.body;
    const booking = await Booking.findById(bookingId).populate('car');
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Tạo orderCode duy nhất (PayOS yêu cầu number, max 53 bit)
    const orderCode = Number(String(Date.now()).slice(-6) + Math.floor(Math.random() * 1000));
    
    // Cập nhật orderCode vào DB để sau webhook map lại được
    booking.orderCode = orderCode;
    await booking.save();

    const YOUR_DOMAIN = 'luxeride://bookings'; // Expo Deep Link

    const body = {
      orderCode: orderCode,
      amount: booking.totalPrice,
      description: `Thanh toan don ${booking._id.toString().slice(-4)}`,
      returnUrl: YOUR_DOMAIN, // Chuyển về app sau khi thanh toán thành công
      cancelUrl: YOUR_DOMAIN,
    };

    const paymentLinkRes = await payos.paymentRequests.create(body);

    res.json({
      success: true,
      checkoutUrl: paymentLinkRes.checkoutUrl,
      orderCode: orderCode
    });
  } catch (error) {
    console.error('Lỗi tạo payment link:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.payosWebhook = async (req, res) => {
  try {
    const webhookData = req.body;
    
    // Xác thực webhook từ PayOS
    const data = payos.webhooks.verify(webhookData);

    if (data.code === '00') {
      const orderCode = data.orderCode;
      
      const booking = await Booking.findOne({
        $or: [
          { orderCode: orderCode },
          { 'pendingExtension.orderCode': orderCode }
        ]
      }).populate('car');
      
      if (booking) {
        if (booking.pendingExtension && booking.pendingExtension.orderCode === orderCode) {
          // Thanh toán gia hạn thành công
          booking.endDate = booking.pendingExtension.newEndDate;
          booking.numberOfDays = booking.numberOfDays + booking.pendingExtension.extraDays;
          booking.totalPrice = booking.totalPrice + booking.pendingExtension.addedFee;
          booking.transactionId = data.transactionReference || ('EXT_' + Date.now());
          booking.pendingExtension = undefined; // Xóa gia hạn chờ
          await booking.save();
          
          await sendConfirmationEmail(booking);
        } else if (booking.orderCode === orderCode && booking.status !== 'Approved') {
          // Thanh toán gốc thành công
          booking.paymentStatus = 'paid';
          booking.status = 'Approved';
          booking.transactionId = data.transactionReference || ('MB_' + Date.now());
          await booking.save();
          
          await sendConfirmationEmail(booking);
        }
      }
    }

    res.json({
      error: 0,
      message: 'Ok',
      data: data
    });
  } catch (error) {
    console.error('Lỗi xử lý webhook:', error);
    res.json({
      error: 0,
      message: 'Ok',
      data: null
    });
  }
};

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

