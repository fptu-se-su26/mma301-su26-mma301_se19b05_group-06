const SellerRequest = require('../models/SellerRequest');
const User = require('../models/User');

exports.submitSellerRequest = async (req, res) => {
  try {
    const existing = await SellerRequest.findOne({ userId: req.user.id, status: 'pending' });
    if (existing) {
      return res.status(400).json({ message: 'You already have a pending seller request' });
    }

    const request = await SellerRequest.create({
      userId: req.user.id,
      message: req.body.message || '',
      status: 'pending'
    });

    res.status(201).json({ message: 'Seller request submitted', request });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getSellerRequests = async (req, res) => {
  try {
    const requests = await SellerRequest.find().populate('userId', 'name email').sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.approveSellerRequest = async (req, res) => {
  try {
    const request = await SellerRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Seller request not found' });

    request.status = 'approved';
    request.adminNotes = req.body.adminNotes || 'Approved by admin';
    request.reviewedBy = req.user.id;
    request.reviewedAt = new Date();
    await request.save();

    await User.findByIdAndUpdate(request.userId, { role: 'seller' });

    res.json({ message: 'Seller request approved', request });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.declineSellerRequest = async (req, res) => {
  try {
    const request = await SellerRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Seller request not found' });

    request.status = 'declined';
    request.adminNotes = req.body.adminNotes || 'Declined by admin';
    request.reviewedBy = req.user.id;
    request.reviewedAt = new Date();
    await request.save();

    res.json({ message: 'Seller request declined', request });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
