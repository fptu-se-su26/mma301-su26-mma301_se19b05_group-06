require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const uri = process.env.MONGODB_URI || 'mongodb+srv://tranchan:1t2r3a4a5n6f@cluster0.8dmrtdn.mongodb.net/car-rental';

async function seedAdmin() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(uri);
    console.log('Connected!');

    // Clean up existing test accounts
    await User.deleteMany({ email: { $in: ['admin@test.com', 'user@test.com'] } });
    console.log('Cleaned up previous test accounts.');

    // Hash password '123456'
    const hashedPassword = await bcrypt.hash('123456', 10);

    // Create Admin User
    await User.create({
      name: 'Admin Tester',
      email: 'admin@test.com',
      password: hashedPassword,
      role: 'admin',
      isVerified: true
    });
    console.log('✅ Created Admin Account: admin@test.com / 123456');

    // Create Customer User
    await User.create({
      name: 'Customer Tester',
      email: 'user@test.com',
      password: hashedPassword,
      role: 'customer',
      isVerified: true
    });
    console.log('✅ Created Customer Account: user@test.com / 123456');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Database disconnected.');
  }
}

seedAdmin();
