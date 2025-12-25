const User = require('../models/User');
const Skill = require('../models/Skill');
const Job = require('../models/Job');
const AdminSettings = require('../models/AdminSettings');
const { paginate, paginationResponse } = require('../utils/helpers');

// @desc    Get all freelancers with filters
// @route   GET /api/users/freelancers
// @access  Public
exports.getFreelancers = async (req, res) => {
    try {
        const {
            skill, minRate, maxRate, minRating,
            search, sortBy = 'quizScore',
            page = 1, limit = 10
        } = req.query;

        // Build query
        const query = {
            role: 'freelancer',
            isSuspended: false
        };

        if (skill) {
            query['skills.skill'] = skill;
            query['skills.passed'] = true;
        }

        if (minRate || maxRate) {
            query.hourlyRate = {};
            if (minRate) query.hourlyRate.$gte = parseInt(minRate);
            if (maxRate) query.hourlyRate.$lte = parseInt(maxRate);
        }

        if (minRating) {
            query.rating = { $gte: parseFloat(minRating) };
        }

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { bio: { $regex: search, $options: 'i' } }
            ];
        }

        const { skip, limit: limitNum } = paginate(page, limit);

        // Sort options
        let sort = {};
        switch (sortBy) {
            case 'quizScore':
                sort = { 'skills.quizScore': -1 };
                break;
            case 'rating':
                sort = { rating: -1 };
                break;
            case 'completedJobs':
            case 'experience':
                sort = { completedJobs: -1 };
                break;
            case 'hourlyRate':
            case 'rate-low':
                sort = { hourlyRate: 1 };
                break;
            case 'rate-high':
                sort = { hourlyRate: -1 };
                break;
            case 'newest':
                sort = { createdAt: -1 };
                break;
            default:
                sort = { 'skills.quizScore': -1 };
        }

        const freelancers = await User.find(query)
            .select('name avatar bio skills hourlyRate rating reviewCount completedJobs location isOnline lastSeen')
            .populate('skills.skill', 'name icon')
            .sort(sort)
            .skip(skip)
            .limit(limitNum);

        const total = await User.countDocuments(query);

        // Get quiz settings
        const questionsCountSetting = await AdminSettings.findOne({ key: 'quiz_questions_count' });
        const quizEnabledSetting = await AdminSettings.findOne({ key: 'quiz_enabled' });

        const quizSettings = {
            questionsCount: questionsCountSetting ? questionsCountSetting.value : 10,
            enabled: quizEnabledSetting ? quizEnabledSetting.value : true
        };

        res.json({
            success: true,
            ...paginationResponse(freelancers, page, limitNum, total),
            quizSettings // Add to response
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get single freelancer profile
// @route   GET /api/users/freelancers/:id
// @access  Public
exports.getFreelancer = async (req, res) => {
    try {
        const freelancer = await User.findOne({
            _id: req.params.id,
            role: 'freelancer'
        })
            .select('-password')
            .populate('skills.skill', 'name icon description');

        if (!freelancer) {
            return res.status(404).json({
                success: false,
                message: 'Freelancer not found'
            });
        }

        // Filter invalid skills
        const freelancerObj = freelancer.toObject();
        if (freelancerObj.skills) {
            freelancerObj.skills = freelancerObj.skills.filter(s => s.skill);
        }

        // Add computed quiz score
        freelancerObj.quizScore = freelancer.getHighestQuizScore();

        // Get quiz settings
        const questionsCountSetting = await AdminSettings.findOne({ key: 'quiz_questions_count' });
        const quizEnabledSetting = await AdminSettings.findOne({ key: 'quiz_enabled' });

        const quizSettings = {
            questionsCount: questionsCountSetting ? questionsCountSetting.value : 10,
            enabled: quizEnabledSetting ? quizEnabledSetting.value : true
        };

        res.json({
            success: true,
            freelancer: freelancerObj,
            quizSettings // Add to response
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get single client profile
// @route   GET /api/users/clients/:id
// @access  Private
exports.getClient = async (req, res) => {
    try {
        const client = await User.findOne({
            _id: req.params.id,
            role: 'client'
        })
            .select('name avatar bio location createdAt');

        if (!client) {
            return res.status(404).json({
                success: false,
                message: 'Client not found'
            });
        }

        res.json({
            success: true,
            client
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get top rated freelancers
// @route   GET /api/users/top-freelancers
// @access  Public
exports.getTopFreelancers = async (req, res) => {
    try {
        const { limit = 6, skill } = req.query;

        const query = {
            role: 'freelancer',
            isSuspended: false
        };

        if (skill) {
            query['skills.skill'] = skill;
            query['skills.passed'] = true;
        }

        const freelancers = await User.find(query)
            .select('name avatar bio skills hourlyRate rating reviewCount completedJobs')
            .populate('skills.skill', 'name icon')
            .sort({ rating: -1, completedJobs: -1 })
            .limit(parseInt(limit));

        res.json({
            success: true,
            count: freelancers.length,
            freelancers
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get platform stats
// @route   GET /api/users/stats
// @access  Public
exports.getStats = async (req, res) => {
    try {
        const totalFreelancers = await User.countDocuments({ role: 'freelancer', isSuspended: false });
        const totalClients = await User.countDocuments({ role: 'client' });
        const totalSkills = await Skill.countDocuments({ isActive: true });

        const totalJobs = await Job.countDocuments({ isActive: true });
        const completedJobs = await Job.countDocuments({ status: 'completed' });

        res.json({
            success: true,
            stats: {
                totalFreelancers,
                totalClients,
                totalJobs,
                completedJobs,
                totalSkills
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
// @desc    Get current user profile
// @route   GET /api/users/profile
// @access  Private
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .select('-password')
            .populate('skills.skill', 'name icon');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Filter out any skills that failed to populate (where skill is null)
        const userObj = user.toObject();
        if (userObj.skills) {
            userObj.skills = userObj.skills.filter(s => s.skill);
        }

        // Add computed quiz score from model method
        userObj.quizScore = user.getHighestQuizScore();

        // Get quiz settings (only if freelancer)
        if (user.role === 'freelancer') {
            const questionsCountSetting = await AdminSettings.findOne({ key: 'quiz_questions_count' });
            const quizEnabledSetting = await AdminSettings.findOne({ key: 'quiz_enabled' });

            userObj.quizSettings = {
                questionsCount: questionsCountSetting ? questionsCountSetting.value : 10,
                enabled: quizEnabledSetting ? quizEnabledSetting.value : true
            };
        }

        res.json(userObj);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Handle file upload
        if (req.file) {
            user.avatar = req.file.path;
        }

        // Update fields based on role
        if (user.role === 'client') {
            if (req.body.name) user.name = req.body.name;
            if (req.body.company) user.company = req.body.company;
            if (req.body.phone) user.phone = req.body.phone;
            if (req.body.location) user.location = req.body.location;
            if (req.body.bio) user.bio = req.body.bio;
        } else if (user.role === 'freelancer') {
            if (req.body.name) user.name = req.body.name;
            if (req.body.title) user.title = req.body.title;
            if (req.body.bio) user.bio = req.body.bio;
            if (req.body.hourlyRate) user.hourlyRate = req.body.hourlyRate;
            if (req.body.experienceLevel) user.experienceLevel = req.body.experienceLevel;
            if (req.body.portfolio) user.portfolio = req.body.portfolio;
            if (req.body.location) user.location = req.body.location;

            if (req.body.socialLinks) {
                user.socialLinks = {
                    ...user.socialLinks,
                    ...req.body.socialLinks
                };
            }

            if (req.body.skills) {
                // Parse skills if sent as JSON string (from FormData)
                let newSkills = req.body.skills;
                if (typeof newSkills === 'string') {
                    try {
                        newSkills = JSON.parse(newSkills);
                    } catch (e) {
                        newSkills = [];
                    }
                }

                if (Array.isArray(newSkills)) {
                    // Get existing skills map for quick lookup
                    const existingSkillsMap = new Map(
                        user.skills.map(s => [s.skill.toString(), s])
                    );

                    // Build new skills array, preserving existing data (quiz scores etc)
                    user.skills = newSkills.map(skillId => {
                        if (existingSkillsMap.has(skillId)) {
                            return existingSkillsMap.get(skillId);
                        }
                        return {
                            skill: skillId,
                            passed: false,
                            quizScore: 0
                        };
                    });
                }
            }
        } else if (user.role === 'admin') {
            if (req.body.name) user.name = req.body.name;
        }

        const updatedUser = await user.save();

        res.json({
            success: true,
            message: 'Profile updated successfully',
            user: updatedUser
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Change password
// @route   PUT /api/users/change-password
// @access  Private
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        const user = await User.findById(req.user.id).select('+password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check current password
        const isMatch = await user.matchPassword(currentPassword);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid current password'
            });
        }

        user.password = newPassword;
        await user.save();

        res.json({
            success: true,
            message: 'Password updated successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get client dashboard stats
// @route   GET /api/users/client/stats
// @access  Private (Client)
exports.getClientDashboardStats = async (req, res) => {
    try {
        const jobs = await Job.find({ client: req.user._id });
        
        const activeJobs = jobs.filter(j => j.status === 'in-progress' || j.status === 'open').length;
        const completedJobs = jobs.filter(j => j.status === 'completed').length;
        
        // Calculate total spent from transactions
        const Transaction = require('../models/Transaction');
        const totalSpentResult = await Transaction.aggregate([
            {
                $match: {
                    from: req.user._id,
                    type: 'payment',
                    status: 'completed'
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$amount' }
                }
            }
        ]);
        
        const totalSpent = totalSpentResult.length > 0 ? totalSpentResult[0].total : 0;

        res.json({
            success: true,
            stats: {
                activeJobs,
                completedJobs,
                totalSpent
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
