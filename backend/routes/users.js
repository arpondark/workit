const express = require('express');
const router = express.Router();
const { protect, optionalAuth } = require('../middleware/auth');
const {
    getFreelancers,
    getFreelancer,
    getClient,
    getTopFreelancers,
    getStats
} = require('../controllers/usersController');

// @route   GET /api/users/freelancers
// @desc    Get all freelancers with filters
// @access  Public
router.get('/freelancers', optionalAuth, getFreelancers);

// @route   GET /api/users/freelancers/:id
// @desc    Get single freelancer profile
// @access  Public
router.get('/freelancers/:id', getFreelancer);

// @route   GET /api/users/clients/:id
// @desc    Get single client profile
// @access  Private
router.get('/clients/:id', protect, getClient);

// @route   GET /api/users/top-freelancers
// @desc    Get top rated freelancers
// @access  Public
router.get('/top-freelancers', getTopFreelancers);

// @route   GET /api/users/stats
// @desc    Get platform stats
// @access  Public
router.get('/stats', getStats);

module.exports = router;
