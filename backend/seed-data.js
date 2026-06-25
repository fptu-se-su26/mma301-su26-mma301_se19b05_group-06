const mongoose = require('mongoose');

// Thay bằng URI của bạn (nếu có thêm tên database ở cuối thì càng tốt, vd: ...mongodb.net/car-rental)
const uri = 'mongodb+srv://tranchan:1t2r3a4a5n6f@cluster0.8dmrtdn.mongodb.net/car-rental';

// 1. Định nghĩa Schema cho Car (Xe)
const carSchema = new mongoose.Schema({
  brand: String,
  model: String,
  imageUrl: String,
  pricePerDay: Number,
  rating: Number,
  location: String,
  type: String,
  seats: Number,
  transmission: String,
  fuelType: String,
});
const Car = mongoose.model('Car', carSchema);

// 2. Định nghĩa Schema cho User (Người dùng)
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  role: { type: String, default: 'user' },
});
const User = mongoose.model('User', userSchema);

// 3. Dữ liệu mẫu (Mock data)
const mockCars = [
  {
    brand: 'Porsche',
    model: '911 Carrera',
    imageUrl: 'https://images.unsplash.com/photo-1503376712351-1c4b22b64b15?q=80&w=1000&auto=format&fit=crop',
    pricePerDay: 5000000,
    rating: 4.9,
    location: 'Hồ Chí Minh',
    type: 'LUXURY',
    seats: 4,
    transmission: 'Automatic',
    fuelType: 'Gasoline',
  },
  {
    brand: 'Tesla',
    model: 'Model S',
    imageUrl: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?q=80&w=1000&auto=format&fit=crop',
    pricePerDay: 3500000,
    rating: 4.8,
    location: 'Hà Nội',
    type: 'ELECTRIC',
    seats: 5,
    transmission: 'Automatic',
    fuelType: 'EV',
  },
  {
    brand: 'Mercedes-Benz',
    model: 'G-Class',
    imageUrl: 'https://images.unsplash.com/photo-1520031441872-265e4ff70366?q=80&w=1000&auto=format&fit=crop',
    pricePerDay: 6000000,
    rating: 5.0,
    location: 'Đà Nẵng',
    type: 'SUV',
    seats: 5,
    transmission: 'Automatic',
    fuelType: 'Gasoline',
  }
];

const mockUsers = [
  { name: 'Admin Tèo', email: 'admin@carrental.com', role: 'admin' },
  { name: 'User Tí', email: 'user@carrental.com', role: 'user' },
];

async function seedData() {
  try {
    console.log("Đang kết nối tới MongoDB...");
    await mongoose.connect(uri);
    console.log("Kết nối thành công! Đang xóa dữ liệu cũ (nếu có)...");

    // Xóa dữ liệu cũ để tránh trùng lặp
    await Car.deleteMany({});
    await User.deleteMany({});

    console.log("Đang thêm dữ liệu mới...");
    await Car.insertMany(mockCars);
    await User.insertMany(mockUsers);

    console.log("✅ Thêm dữ liệu thành công! Bạn của bạn có thể test ứng dụng được rồi!");
  } catch (err) {
    console.error("❌ Lỗi khi thêm dữ liệu:", err);
  } finally {
    await mongoose.disconnect();
    console.log("Đã ngắt kết nối.");
  }
}

seedData();
