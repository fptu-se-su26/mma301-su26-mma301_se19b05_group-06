const express = require('express');
const { protect } = require('../middleware/auth');
const { getReviewsByCar, createReview, deleteReview } = require('../controllers/reviewController');

const router = express.Router();

router.get('/car/:carId', getReviewsByCar);
router.post('/', protect, createReview);
router.delete('/:id', protect, deleteReview);

module.exports = router;
