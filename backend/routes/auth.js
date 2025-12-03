const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    registerClient,
    registerFreelancer,
    login,
    adminLogin,
    getMe,
    logout,
    updateProfile,
    changePassword,
    verifyQuizToken
} = require('../controllers/authController');

// @route   POST /api/auth/register/client
// @desc    Register a new client
// @access  Public
router.post('/register/client', registerClient);

// @route   POST /api/auth/register/freelancer
// @desc    Register a new freelancer (requires quiz pass token)
// @access  Public
router.post('/register/freelancer', registerFreelancer);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', login);

// @route   POST /api/auth/admin/login
// @desc    Login admin
// @access  Public
router.post('/admin/login', adminLogin);

// @route   GET /api/auth/me
// @desc    Get current logged in user
// @access  Private
router.get('/me', protect, getMe);

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', protect, logout);

// @route   PUT /api/auth/update-profile
// @desc    Update user profile
// @access  Private
router.put('/update-profile', protect, updateProfile);

// @route   PUT /api/auth/change-password
// @desc    Change password
// @access  Private
router.put('/change-password', protect, changePassword);

// @route   POST /api/auth/verify-quiz-token
// @desc    Verify if quiz pass token is valid
// @access  Public
router.post('/verify-quiz-token', verifyQuizToken);

module.exports = router;
