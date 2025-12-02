const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Skill = require('../models/Skill');
const QuizAttempt = require('../models/QuizAttempt');
const { protect, authorize } = require('../middleware/auth');
const { generateToken, sanitizeUser } = require('../utils/helpers');

// @route   POST /api/auth/register/client
// @desc    Register a new client
// @access  Public
router.post('/register/client', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check if user exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email'
            });
        }

        // Create client user
        const user = await User.create({
            name,
            email,
            password,
            role: 'client'
        });

        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            message: 'Client registered successfully',
            token,
            user: sanitizeUser(user)
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   POST /api/auth/register/freelancer
// @desc    Register a new freelancer (requires quiz pass token)
// @access  Public
router.post('/register/freelancer', async (req, res) => {
    try {
        const { name, email, password, quizPassToken, skillId } = req.body;

        // Validate quiz pass token
        if (!quizPassToken) {
            return res.status(400).json({
                success: false,
                message: 'Quiz pass token is required. Please pass the skill quiz first.'
            });
        }

        // Find the quiz attempt with this token
        const quizAttempt = await QuizAttempt.findOne({
            passToken: quizPassToken,
            email: email.toLowerCase(),
            passed: true,
            passTokenUsed: false
        });

        if (!quizAttempt) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired quiz pass token. Please take the skill quiz again.'
            });
        }

        // Check if token has expired (24 hours)
        if (quizAttempt.passTokenExpiresAt && new Date() > quizAttempt.passTokenExpiresAt) {
            return res.status(400).json({
                success: false,
                message: 'Quiz pass token has expired. Please take the skill quiz again.'
            });
        }

        // Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email'
            });
        }

        // Get skill details
        const skill = await Skill.findById(quizAttempt.skill);

        // Create freelancer user
        const user = await User.create({
            name,
            email,
            password,
            role: 'freelancer',
            skills: [{
                skill: quizAttempt.skill,
                quizScore: quizAttempt.score,
                passed: true,
                passedAt: new Date()
            }]
        });

        // Mark token as used
        quizAttempt.passTokenUsed = true;
        await quizAttempt.save();

        // Increment freelancer count for the skill
        await Skill.findByIdAndUpdate(quizAttempt.skill, {
            $inc: { freelancerCount: 1 }
        });

        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            message: 'Freelancer registered successfully',
            token,
            user: sanitizeUser(user)
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate email & password
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        // Check for user
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check if suspended
        if (user.isSuspended) {
            return res.status(403).json({
                success: false,
                message: 'Your account has been suspended. Please contact support.'
            });
        }

        // Check if password matches
        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Update online status
        user.isOnline = true;
        user.lastSeen = new Date();
        await user.save();

        const token = generateToken(user._id);

        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: sanitizeUser(user)
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   POST /api/auth/admin/login
// @desc    Login admin
// @access  Public
router.post('/admin/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        const user = await User.findOne({ email, role: 'admin' }).select('+password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid admin credentials'
            });
        }

        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid admin credentials'
            });
        }

        const token = generateToken(user._id);

        res.json({
            success: true,
            message: 'Admin login successful',
            token,
            user: sanitizeUser(user)
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   GET /api/auth/me
// @desc    Get current logged in user
// @access  Private
router.get('/me', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate('skills.skill');
        
        res.json({
            success: true,
            user: sanitizeUser(user)
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', protect, async (req, res) => {
    try {
        // Update online status
        await User.findByIdAndUpdate(req.user._id, {
            isOnline: false,
            lastSeen: new Date()
        });

        res.json({
            success: true,
            message: 'Logged out successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   PUT /api/auth/update-profile
// @desc    Update user profile
// @access  Private
router.put('/update-profile', protect, async (req, res) => {
    try {
        const allowedUpdates = [
            'name', 'bio', 'avatar', 'hourlyRate', 'location', 
            'phone', 'website', 'socialLinks'
        ];

        const updates = {};
        Object.keys(req.body).forEach(key => {
            if (allowedUpdates.includes(key)) {
                updates[key] = req.body[key];
            }
        });

        const user = await User.findByIdAndUpdate(
            req.user._id,
            updates,
            { new: true, runValidators: true }
        ).populate('skills.skill');

        res.json({
            success: true,
            message: 'Profile updated successfully',
            user: sanitizeUser(user)
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   PUT /api/auth/change-password
// @desc    Change password
// @access  Private
router.put('/change-password', protect, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        const user = await User.findById(req.user._id).select('+password');

        const isMatch = await user.comparePassword(currentPassword);

        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        user.password = newPassword;
        await user.save();

        res.json({
            success: true,
            message: 'Password changed successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   POST /api/auth/verify-quiz-token
// @desc    Verify if quiz pass token is valid
// @access  Public
router.post('/verify-quiz-token', async (req, res) => {
    try {
        const { email, quizPassToken } = req.body;

        const quizAttempt = await QuizAttempt.findOne({
            passToken: quizPassToken,
            email: email.toLowerCase(),
            passed: true,
            passTokenUsed: false
        }).populate('skill');

        if (!quizAttempt) {
            return res.status(400).json({
                success: false,
                valid: false,
                message: 'Invalid or used quiz pass token'
            });
        }

        if (quizAttempt.passTokenExpiresAt && new Date() > quizAttempt.passTokenExpiresAt) {
            return res.status(400).json({
                success: false,
                valid: false,
                message: 'Quiz pass token has expired'
            });
        }

        res.json({
            success: true,
            valid: true,
            skill: quizAttempt.skill,
            score: quizAttempt.score
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;
