const express = require('express');
const router = express.Router();
const sellerController = require('../controllers/sellerController');
const { protect, adminOnly } = require('../middleware/auth');

router.post('/request', protect, sellerController.submitRequest);
router.get('/my-request', protect, sellerController.getMyRequestStatus);
router.get('/requests', protect, adminOnly, sellerController.getAllRequests);
router.put('/requests/:id', protect, adminOnly, sellerController.reviewRequest);

module.exports = router;
