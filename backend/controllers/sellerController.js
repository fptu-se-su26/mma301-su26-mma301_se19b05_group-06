const SellerRequest = require('../models/SellerRequest');
const User = require('../models/User');

exports.submitRequest = async (req, res) => {
  try {
    const { fullName, idCardImage, agreedToTerms } = req.body;
    
    if (!agreedToTerms) {
      return res.status(400).json({ message: 'You must agree to the terms.' });
    }

    const existingRequest = await SellerRequest.findOne({ user: req.user.id });
    if (existingRequest && existingRequest.status === 'pending') {
      return res.status(400).json({ message: 'You already have a pending request.' });
    }

    const newRequest = new SellerRequest({
      user: req.user.id,
      fullName,
      idCardImage,
      agreedToTerms
    });

    await newRequest.save();
    res.status(201).json({ message: 'Request submitted successfully.', request: newRequest });
  } catch (error) {
    res.status(500).json({ message: 'Error submitting request', error: error.message });
  }
};

exports.getMyRequestStatus = async (req, res) => {
  try {
    const request = await SellerRequest.findOne({ user: req.user.id }).sort({ createdAt: -1 });
    if (!request) {
      return res.status(404).json({ message: 'No request found' });
    }
    res.json({ status: request.status, request });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching request status', error: error.message });
  }
};

exports.getAllRequests = async (req, res) => {
  try {
    const requests = await SellerRequest.find({ status: 'pending' }).populate('user', 'name email');
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching requests', error: error.message });
  }
};

exports.reviewRequest = async (req, res) => {
  try {
    const { action } = req.body; // 'approve' or 'reject'
    const request = await SellerRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (action === 'approve') {
      request.status = 'approved';
      await User.findByIdAndUpdate(request.user, { role: 'seller' });
    } else if (action === 'reject') {
      request.status = 'rejected';
    } else {
      return res.status(400).json({ message: 'Invalid action' });
    }

    await request.save();
    res.json({ message: `Request ${action}d successfully.`, request });
  } catch (error) {
    res.status(500).json({ message: 'Error reviewing request', error: error.message });
  }
};
