const User = require('../models/User');
const Skill = require('../models/Skill');
const Job = require('../models/Job');
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
                sort = { completedJobs: -1 };
                break;
            case 'hourlyRate':
                sort = { hourlyRate: 1 };
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

        res.json({
            success: true,
            ...paginationResponse(freelancers, page, limitNum, total)
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

        res.json({
            success: true,
            freelancer
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
