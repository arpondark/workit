const User = require('../models/User');
const Skill = require('../models/Skill');
const QuizAttempt = require('../models/QuizAttempt');
const AdminSettings = require('../models/AdminSettings');
const { generateToken, sanitizeUser } = require('../utils/helpers');

// @desc    Get public auth config
// @route   GET /api/auth/config
// @access  Public
exports.getAuthConfig = async (req, res) => {
    try {
        const quizEnabledSetting = await AdminSettings.findOne({ key: 'quiz_enabled' });

        res.json({
            success: true,
            config: {
                quizEnabled: quizEnabledSetting ? quizEnabledSetting.value : true
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Register a new client
// @route   POST /api/auth/register/client
// @access  Public
exports.registerClient = async (req, res) => {
    // ... (keep existing registerClient code) ...
    try {
        const { name, email, password, company } = req.body;

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
            company,
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
};

// @desc    Register a new freelancer (requires quiz pass token unless disabled)
// @route   POST /api/auth/register/freelancer
// @access  Public
exports.registerFreelancer = async (req, res) => {
    try {
        const { name, email, password, quizPassToken, skillId } = req.body;

        // Check if quiz is enabled
        const quizEnabledSetting = await AdminSettings.findOne({ key: 'quiz_enabled' });
        const quizEnabled = quizEnabledSetting ? quizEnabledSetting.value : true;

        let skillToRegister = skillId;
        let quizScore = 0;
        let passed = false;

        if (quizEnabled) {
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

            skillToRegister = quizAttempt.skill;
            quizScore = quizAttempt.score;
            passed = true;

            // Mark token as used
            quizAttempt.passTokenUsed = true;
            await quizAttempt.save();
        } else {
            // Quiz disabled, verify skillId is provided
            if (!skillId) {
                return res.status(400).json({
                    success: false,
                    message: 'Skill ID is required'
                });
            }
            // Auto-pass
            passed = true;
        }

        // Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email'
            });
        }

        // Create freelancer user
        const user = await User.create({
            name,
            email,
            password,
            role: 'freelancer',
            skills: [{
                skill: skillToRegister,
                quizScore: quizScore,
                passed: passed,
                passedAt: new Date()
            }]
        });

        // Increment freelancer count for the skill
        await Skill.findByIdAndUpdate(skillToRegister, {
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
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
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
};

// @desc    Login admin
// @route   POST /api/auth/admin/login
// @access  Public
exports.adminLogin = async (req, res) => {
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
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
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
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res) => {
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
};

// @desc    Update user profile
// @route   PUT /api/auth/update-profile
// @access  Private
exports.updateProfile = async (req, res) => {
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
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
exports.changePassword = async (req, res) => {
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
};

// @desc    Verify if quiz pass token is valid
// @route   POST /api/auth/verify-quiz-token
// @access  Public
exports.verifyQuizToken = async (req, res) => {
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
};
