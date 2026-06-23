require('dotenv').config();
const mongoose = require('mongoose');
const Car = require('./models/Car');
const PricingSurge = require('./models/PricingSurge');

const uri = process.env.MONGODB_URI || 'mongodb+srv://tranchan:1t2r3a4a5n6f@cluster0.8dmrtdn.mongodb.net/car-rental';

async function seedTestingSurges() {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(uri);
    console.log('Connected!');

    // 1. Clean up old surges
    await PricingSurge.deleteMany({});
    console.log('Cleared old pricing surges.');

    // 2. Fetch cars from DB
    const cars = await Car.find({});
    if (cars.length < 3) {
      console.log('⚠️ Need at least 3 cars in the database to run full tests. Run seed-data.js first.');
      return;
    }

    // 3. Create 4 surges representing 4 color tiers
    const testSurges = [
      {
        car: cars[0]._id,
        multiplier: 1.10, // 🟢 Tier: Normal (Xanh lá)
        reason: 'Low season slight adjustment',
        startDate: '2026-06-01',
        endDate: '2026-06-30',
        isActive: true
      },
      {
        car: cars[1]._id,
        multiplier: 1.30, // 🟡 Tier: Elevated (Vàng)
        reason: 'Weekend local leisure peak',
        startDate: '2026-06-01',
        endDate: '2026-06-30',
        isActive: true
      },
      {
        car: cars[2]._id,
        multiplier: 1.50, // 🟠 Tier: High (Cam)
        reason: 'Airport shuttle peak demand',
        startDate: '2026-06-01',
        endDate: '2026-06-30',
        isActive: true
      }
    ];

    // If there is a 4th car, use it. Otherwise bind to first car with higher rate.
    if (cars[3]) {
      testSurges.push({
        car: cars[3]._id,
        multiplier: 1.85, // 🔴 Tier: Critical (Đỏ)
        reason: 'Formula 1 racing event holiday',
        startDate: '2026-06-01',
        endDate: '2026-06-30',
        isActive: true
      });
    } else {
      testSurges.push({
        car: cars[0]._id,
        multiplier: 1.85, // 🔴 Tier: Critical (Đỏ)
        reason: 'Formula 1 racing event holiday',
        startDate: '2026-06-01',
        endDate: '2026-06-30',
        isActive: true
      });
    }

    await PricingSurge.insertMany(testSurges);
    console.log('✅ Successfully seeded 4 test pricing surge tiers into MongoDB!');
    
  } catch (error) {
    console.error('Seeding failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Database disconnected.');
  }
}

seedTestingSurges();
