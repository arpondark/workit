const express = require('express');
const router = express.Router();
const { getPublicLearningResources } = require('../controllers/learningResourcesController');

// @route   GET /api/learning-resources
// @desc    Get all public learning resources
// @access  Public
router.get('/', getPublicLearningResources);

module.exports = router;
