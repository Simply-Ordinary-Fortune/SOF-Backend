const express = require('express');
const { authenticateToken } = require('../../middleware/authMiddleware');
const { getTagStatistics } = require('../../controllers/statisticsController');

const router = express.Router();

router.get('/user/:userId', authenticateToken, getTagStatistics);

module.exports = router;
