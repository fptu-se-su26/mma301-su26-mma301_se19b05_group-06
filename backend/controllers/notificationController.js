const Notification = require('../models/Notification');

exports.getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id })
      .sort({ createdAt: -1 });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.markNotificationRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    if (notification.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You are not authorized to access this notification' });
    }

    notification.isRead = true;
    await notification.save();
    res.json(notification);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.markAllNotificationsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user.id, isRead: false },
      { isRead: true }
    );
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Helper function to create notification from backend triggers
exports.createSystemNotification = async (userId, title, message) => {
  try {
    const notification = new Notification({
      userId,
      title,
      message
    });
    await notification.save();
    return notification;
  } catch (error) {
    console.error('Error creating system notification:', error.message);
  }
};
