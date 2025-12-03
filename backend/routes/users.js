const express = require('express');
const router = express.Router();
const { protect, optionalAuth } = require('../middleware/auth');
const {
    getFreelancers,
    getFreelancer,
    getClient,
    getTopFreelancers,
    getStats,
    getProfile,
    updateProfile,
    changePassword
} = require('../controllers/usersController');
const multer = require('multer');
const { storage } = require('../config/cloudinary');
const upload = multer({ storage });

// @route   GET /api/users/profile
// @desc    Get current user profile
// @access  Private
router.get('/profile', protect, getProfile);

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', protect, upload.single('photo'), updateProfile);

// @route   PUT /api/users/change-password
// @desc    Change password
// @access  Private
router.put('/change-password', protect, changePassword);

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
