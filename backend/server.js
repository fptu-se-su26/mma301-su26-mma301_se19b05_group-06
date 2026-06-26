require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Bắt lỗi khi Client gửi lên JSON bị lỗi cú pháp (để tránh crash server)
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    console.error('Bắt được lỗi JSON:', err.message);
    return res.status(400).send({ message: 'Dữ liệu JSON gửi lên bị lỗi cú pháp' });
  }
  next();
});

// MongoDB Connection
const uri = process.env.MONGODB_URI || 'mongodb+srv://tranchan:1t2r3a4a5n6f@cluster0.8dmrtdn.mongodb.net/car-rental';

// --- ROUTE IMPORTS ---
const authRoutes = require('./routes/authRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const carRoutes = require('./routes/carRoutes');

const sellerRoutes = require('./routes/sellerRoutes');
app.use('/api/seller', sellerRoutes);


// 1. API lấy danh sách xe
app.get('/api/cars', async (req, res) => {
  try {
    const cars = await Car.find({});
    // App đang dùng axios và expect res.data là mảng cars
    res.json(cars);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server khi lấy dữ liệu xe' });
  }
// --- API ENDPOINTS ---
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', analyticsRoutes);
app.use('/api/cars', carRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

// Start Server
mongoose.connect(uri).then(() => {
  console.log(`✅ Đã kết nối MongoDB (Database: ${mongoose.connection.name})`);
  app.listen(PORT, () => {
    console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('❌ Kết nối MongoDB thất bại:', err);
});
