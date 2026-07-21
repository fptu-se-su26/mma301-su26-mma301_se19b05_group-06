const express = require('express');
const { protect } = require('../middleware/auth');
const { chatAI } = require('../controllers/aiController');

const router = express.Router();

router.post('/chat', protect, chatAI);

module.exports = router;
