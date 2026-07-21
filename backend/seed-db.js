require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('./models/User');
const Car = require('./models/Car');
const Booking = require('./models/Booking');
const Voucher = require('./models/Voucher');
const Notification = require('./models/Notification');

const uri = process.env.MONGODB_URI || 'mongodb+srv://carAdmin:CarRental2026Secure@cluster0.vsccwa0.mongodb.net/carRentalVIP?retryWrites=true&w=majority';

const mockCars = [
  {
    brand: 'Rolls-Royce',
    model: 'Phantom VIII',
    imageUrl: 'https://images.unsplash.com/photo-1632245889029-e406faaa34cd?q=80&w=600&auto=format&fit=crop',
    pricePerDay: 15000000,
    rating: 5.0,
    location: 'Hanoi Premium Hub',
    type: 'Hypercar',
    seats: 4,
    transmission: 'Automatic',
    fuelType: 'Petrol'
  },
  {
    brand: 'Porsche',
    model: '911 Carrera',
    imageUrl: 'https://images.unsplash.com/photo-1503376712351-1c4b22b64b15?q=80&w=600&auto=format&fit=crop',
    pricePerDay: 5000000,
    rating: 4.9,
    location: 'HCMC Luxury Center',
    type: 'Supercar',
    seats: 4,
    transmission: 'Automatic',
    fuelType: 'Petrol'
  },
  {
    brand: 'Mercedes-Benz',
    model: 'G-Class G63',
    imageUrl: 'https://images.unsplash.com/photo-1520031441872-265e4ff70366?q=80&w=600&auto=format&fit=crop',
    pricePerDay: 8000000,
    rating: 5.0,
    location: 'Da Nang Hub',
    type: 'SUV',
    seats: 5,
    transmission: 'Automatic',
    fuelType: 'Petrol'
  },
  {
    brand: 'Tesla',
    model: 'Model S Plaid',
    imageUrl: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?q=80&w=600&auto=format&fit=crop',
    pricePerDay: 3500000,
    rating: 4.8,
    location: 'Hanoi Premium Hub',
    type: 'Electric',
    seats: 5,
    transmission: 'Automatic',
    fuelType: 'EV'
  },
  {
    brand: 'Bentley',
    model: 'Continental GT',
    imageUrl: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?q=80&w=600&auto=format&fit=crop',
    pricePerDay: 9000000,
    rating: 4.9,
    location: 'HCMC Luxury Center',
    type: 'Luxury Sedan',
    seats: 4,
    transmission: 'Automatic',
    fuelType: 'Petrol'
  }
];

const mockVouchers = [
  {
    code: 'WELCOME',
    discountType: 'percentage',
    discountValue: 10,
    minBookingValue: 0,
    maxUsage: 100,
    usedCount: 0,
    expiryDate: new Date('2027-12-31'),
    isActive: true,
    description: 'Welcome voucher 10% off for new customers'
  },
  {
    code: 'ELITE15',
    discountType: 'percentage',
    discountValue: 15,
    minBookingValue: 5000000,
    maxUsage: 50,
    usedCount: 0,
    expiryDate: new Date('2027-12-31'),
    isActive: true,
    description: 'Exclusive 15% discount for orders over 5,000,000 VNĐ'
  },
  {
    code: 'SVJ30',
    discountType: 'percentage',
    discountValue: 30,
    minBookingValue: 10000000,
    maxUsage: 10,
    usedCount: 0,
    expiryDate: new Date('2027-12-31'),
    isActive: true,
    description: 'VIP SVJ voucher 30% off for orders over 10,000,000 VNĐ'
  }
];

async function seed() {
  try {
    console.log('⏳ Connecting to MongoDB...');
    await mongoose.connect(uri);
    console.log('✅ Connected successfully!');

    // Clear old data
    console.log('🧹 Clearing old cars, vouchers, bookings, and notifications...');
    await Car.deleteMany({});
    await Voucher.deleteMany({});
    await Booking.deleteMany({});
    await Notification.deleteMany({});
    await User.deleteMany({ email: { $in: ['admin@luxeride.com', 'customer@luxeride.com'] } });

    // Seed Cars
    console.log('🚗 Seeding cars...');
    const insertedCars = await Car.insertMany(mockCars);
    console.log(`Added ${insertedCars.length} cars.`);

    // Seed Vouchers
    console.log('🎫 Seeding vouchers...');
    const insertedVouchers = await Voucher.insertMany(mockVouchers);
    console.log(`Added ${insertedVouchers.length} vouchers.`);

    // Hash passwords for users
    console.log('🔑 Creating users...');
    const hashedPassword = await bcrypt.hash('Password123', 10);

    const adminUser = new User({
      name: 'Admin LuxeRide',
      email: 'admin@luxeride.com',
      password: hashedPassword,
      role: 'admin',
      status: 'Active',
      isVerified: true
    });
    await adminUser.save();

    const customerUser = new User({
      name: 'Tuan Anh Customer',
      email: 'customer@luxeride.com',
      password: hashedPassword,
      role: 'customer',
      status: 'Active',
      isVerified: true
    });
    await customerUser.save();
    console.log('Added Admin and Customer accounts.');

    // Seed Completed and Pending bookings for testing
    console.log('📅 Seeding bookings for customer...');
    const car1 = insertedCars[0]; // Rolls-Royce
    const car2 = insertedCars[1]; // Porsche

    const today = new Date();
    
    // Completed Booking (For testing Review creation)
    const completedStartDate = new Date();
    completedStartDate.setDate(today.getDate() - 5);
    const completedEndDate = new Date();
    completedEndDate.setDate(today.getDate() - 3);

    const completedBooking = new Booking({
      carId: car1._id,
      car: car1._id,
      userId: customerUser._id,
      startDate: completedStartDate,
      endDate: completedEndDate,
      pickupDate: completedStartDate,
      returnDate: completedEndDate,
      pricePerDay: car1.pricePerDay,
      numberOfDays: 2,
      totalPrice: car1.pricePerDay * 2,
      pickupLocation: car1.location,
      dropoffLocation: car1.location,
      customerName: customerUser.name,
      customerEmail: customerUser.email,
      customerPhone: '0987654321',
      paymentMethod: 'bank_transfer',
      status: 'Completed',
      paymentStatus: 'paid'
    });
    await completedBooking.save();

    // Pending Booking (For testing Extend / Cancel / Payments)
    const pendingStartDate = new Date();
    pendingStartDate.setDate(today.getDate() + 2);
    const pendingEndDate = new Date();
    pendingEndDate.setDate(today.getDate() + 5);

    const pendingBooking = new Booking({
      carId: car2._id,
      car: car2._id,
      userId: customerUser._id,
      startDate: pendingStartDate,
      endDate: pendingEndDate,
      pickupDate: pendingStartDate,
      returnDate: pendingEndDate,
      pricePerDay: car2.pricePerDay,
      numberOfDays: 3,
      totalPrice: car2.pricePerDay * 3,
      pickupLocation: car2.location,
      dropoffLocation: car2.location,
      customerName: customerUser.name,
      customerEmail: customerUser.email,
      customerPhone: '0987654321',
      paymentMethod: 'bank_transfer',
      status: 'Pending',
      paymentStatus: 'pending'
    });
    await pendingBooking.save();
    console.log('Added completed and pending bookings.');

    // Seed some initial notifications in English
    console.log('🔔 Seeding initial notifications...');
    const notif1 = new Notification({
      userId: customerUser._id,
      title: 'Welcome to LuxeRide',
      message: 'Thank you for choosing LuxeRide. Your account has been verified successfully. Enjoy renting our luxury vehicles!',
      isRead: false
    });
    await notif1.save();

    const notif2 = new Notification({
      userId: customerUser._id,
      title: 'Trip Completed',
      message: `Your trip with the Rolls-Royce Phantom VIII has been completed. Please submit a review to share your feedback!`,
      isRead: true
    });
    await notif2.save();
    console.log('Added initial notifications.');

    console.log('🎉 Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected.');
  }
}

seed();
