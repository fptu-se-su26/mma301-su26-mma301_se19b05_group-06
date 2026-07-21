const express = require('express');
const { protect } = require('../middleware/auth');
const {
  getMyNotifications,
  markNotificationRead,
  markAllNotificationsRead
} = require('../controllers/notificationController');

const router = express.Router();

router.get('/my', protect, getMyNotifications);
router.put('/:id/read', protect, markNotificationRead);
router.put('/read-all', protect, markAllNotificationsRead);

module.exports = router;
