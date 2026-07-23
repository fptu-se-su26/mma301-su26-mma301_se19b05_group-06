require('dotenv').config();
const mongoose = require('mongoose');

// Thay bằng URI của bạn (nếu có thêm tên database ở cuối thì càng tốt, vd: ...mongodb.net/car-rental)
const uri = process.env.MONGODB_URI || 'mongodb+srv://tranchan:1t2r3a4a5n6f@cluster0.8dmrtdn.mongodb.net/car-rental';

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
  sellerId: mongoose.Schema.Types.ObjectId,
});
const Car = mongoose.model('Car', carSchema);

// 2. Định nghĩa Schema cho User (Người dùng)
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  role: { type: String, default: 'user' },
});
const User = mongoose.model('User', userSchema);

// 3. Dữ liệu xe mẫu
const mockCars = [
  {
    brand: 'Mercedes-Benz',
    model: 'G-Class G63',
    imageUrl: 'https://images.unsplash.com/photo-1520050206274-a1ae446cb3cc?auto=format&fit=crop&q=80&w=800',
    pricePerDay: 8000000,
    rating: 4.9,
    location: 'Hồ Chí Minh',
    type: 'SUV',
    seats: 5,
    transmission: 'Automatic',
    fuelType: 'Gasoline',
  },
  {
    brand: 'Porsche',
    model: '911 Carrera S',
    imageUrl: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&q=80&w=800',
    pricePerDay: 12000000,
    rating: 4.9,
    location: 'Hồ Chí Minh',
    type: 'Coupe',
    seats: 4,
    transmission: 'Automatic',
    fuelType: 'Gasoline',
  },
  {
    brand: 'Rolls-Royce',
    model: 'Ghost V-Specification',
    imageUrl: 'https://images.unsplash.com/photo-1632245889027-e406faaa19cc?auto=format&fit=crop&q=80&w=800',
    pricePerDay: 25000000,
    rating: 5.0,
    location: 'Hà Nội',
    type: 'Sedan',
    seats: 5,
    transmission: 'Automatic',
    fuelType: 'Gasoline',
  },
  {
    brand: 'Audi',
    model: 'R8 V10 Performance',
    imageUrl: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&q=80&w=800',
    pricePerDay: 15000000,
    rating: 4.8,
    location: 'Hà Nội',
    type: 'Coupe',
    seats: 2,
    transmission: 'Automatic',
    fuelType: 'Gasoline',
  },
  {
    brand: 'Bentley',
    model: 'Continental GT',
    imageUrl: 'https://images.unsplash.com/photo-1621135802920-133df287f89c?auto=format&fit=crop&q=80&w=800',
    pricePerDay: 18000000,
    rating: 4.9,
    location: 'Đà Nẵng',
    type: 'Coupe',
    seats: 4,
    transmission: 'Automatic',
    fuelType: 'Gasoline',
  },
  {
    brand: 'Lamborghini',
    model: 'Urus Pearl Capsule',
    imageUrl: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&q=80&w=800',
    pricePerDay: 22000000,
    rating: 4.9,
    location: 'Đà Nẵng',
    type: 'SUV',
    seats: 5,
    transmission: 'Automatic',
    fuelType: 'Gasoline',
  },
  {
    brand: 'Range Rover',
    model: 'SV Autobiography',
    imageUrl: 'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?auto=format&fit=crop&q=80&w=800',
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
  { name: 'Seller Hoa', email: 'seller@test.com', role: 'seller' },
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
    const createdUsers = await User.insertMany(mockUsers);
    
    // Tìm ID của seller
    const seller = createdUsers.find(u => u.role === 'seller');
    
    // Gán sellerId cho tất cả các xe mẫu
    const carsWithSeller = mockCars.map(car => ({
      ...car,
      sellerId: seller ? seller._id : null
    }));

    await Car.insertMany(carsWithSeller);

    console.log("✅ Thêm dữ liệu công! Bạn của bạn có thể test ứng dụng được rồi!");
  } catch (err) {
    console.error("❌ Lỗi khi thêm dữ liệu:", err);
  } finally {
    await mongoose.disconnect();
    console.log("Đã ngắt kết nối.");
  }
}

seedData();
