const express = require('express');
const { adminRouteGuard, sellerOrAdminRouteGuard, protect } = require('../middleware/auth');

const router = express.Router();

// Note: Car model and endpoints will be created inline or separate
// For now, this handles car-related admin endpoints

// ─── Create Car ─────────────────────────────────────────────────────────────
router.post('/', protect, sellerOrAdminRouteGuard, async (req, res) => {
  try {
    if (req.user.role === 'admin') {
      return res.status(403).json({ message: 'Admin không được phép thêm xe mới' });
    }
    const Car = require('../models/Car') || require('mongoose').model('Car');
    const carData = { ...req.body, sellerId: req.user.id };
    const car = new Car(carData);
    await car.save();
    res.status(201).json(car);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── Get All Cars ───────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const Car = require('../models/Car') || require('mongoose').model('Car');
    const cars = await Car.find();
    res.json(cars);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── Get Car by ID ──────────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const Car = require('../models/Car') || require('mongoose').model('Car');
    const car = await Car.findById(req.params.id);
    if (!car) return res.status(404).json({ message: 'Car not found' });
    res.json(car);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── Update Car ─────────────────────────────────────────────────────────────
router.put('/:id', protect, sellerOrAdminRouteGuard, async (req, res) => {
  try {
    const Car = require('../models/Car') || require('mongoose').model('Car');
    const car = await Car.findById(req.params.id);
    if (!car) return res.status(404).json({ message: 'Car not found' });
    
    if (req.user.role === 'seller' && car.sellerId && car.sellerId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Bạn chỉ có quyền sửa xe của chính mình' });
    }
    
    Object.assign(car, req.body);
    await car.save();
    res.json(car);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── Delete Car ─────────────────────────────────────────────────────────────
router.delete('/:id', protect, sellerOrAdminRouteGuard, async (req, res) => {
  try {
    const Car = require('../models/Car') || require('mongoose').model('Car');
    const car = await Car.findById(req.params.id);
    if (!car) return res.status(404).json({ message: 'Car not found' });
    
    if (req.user.role === 'seller' && car.sellerId && car.sellerId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Bạn chỉ có quyền xóa xe của chính mình' });
    }
    
    await Car.findByIdAndDelete(req.params.id);
    res.json({ message: 'Car deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
