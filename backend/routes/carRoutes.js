const express = require('express');
const { adminRouteGuard } = require('../middleware/auth');

const router = express.Router();

// Note: Car model and endpoints will be created inline or separate
// For now, this handles car-related admin endpoints

// ─── Create Car (Admin) ──────────────────────────────────────────────────────
router.post('/', adminRouteGuard, async (req, res) => {
  try {
    const Car = require('../models/Car') || require('mongoose').model('Car');
    const car = new Car(req.body);
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

// ─── Update Car (Admin) ──────────────────────────────────────────────────────
router.put('/:id', adminRouteGuard, async (req, res) => {
  try {
    const Car = require('../models/Car') || require('mongoose').model('Car');
    const car = await Car.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!car) return res.status(404).json({ message: 'Car not found' });
    res.json(car);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── Delete Car (Admin) ──────────────────────────────────────────────────────
router.delete('/:id', adminRouteGuard, async (req, res) => {
  try {
    const Car = require('../models/Car') || require('mongoose').model('Car');
    await Car.findByIdAndDelete(req.params.id);
    res.json({ message: 'Car deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
