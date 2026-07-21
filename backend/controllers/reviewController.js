const Review = require('../models/Review');
const Booking = require('../models/Booking');
const Car = require('../models/Car');

exports.getReviewsByCar = async (req, res) => {
  try {
    const reviews = await Review.find({ carId: req.params.carId })
      .populate('userId', 'name email role')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createReview = async (req, res) => {
  try {
    const { bookingId, rating, comment } = req.body;
    const userId = req.user.id;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.userId.toString() !== userId) {
      return res.status(403).json({ message: 'You are not authorized to review this booking' });
    }

    if (booking.status !== 'Completed') {
      return res.status(400).json({ message: 'You can only review completed trips' });
    }

    const existingReview = await Review.findOne({ bookingId });
    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this booking' });
    }

    const carId = booking.carId;

    const review = new Review({
      carId,
      userId,
      bookingId,
      rating,
      comment
    });
    await review.save();

    // Recalculate average rating
    const reviews = await Review.find({ carId });
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    await Car.findByIdAndUpdate(carId, { rating: Math.round(avgRating * 10) / 10 });

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (review.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You are not authorized to delete this review' });
    }

    const carId = review.carId;
    await Review.findByIdAndDelete(req.params.id);

    // Recalculate average rating
    const reviews = await Review.find({ carId });
    let avgRating = 5;
    if (reviews.length > 0) {
      avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    }
    await Car.findByIdAndUpdate(carId, { rating: Math.round(avgRating * 10) / 10 });

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
