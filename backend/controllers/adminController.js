const User = require('../models/User');
const Skill = require('../models/Skill');
const Question = require('../models/Question');
const Job = require('../models/Job');
const Application = require('../models/Application');
const Transaction = require('../models/Transaction');
const QuizAttempt = require('../models/QuizAttempt');
const AdminSettings = require('../models/AdminSettings');
const { paginate, paginationResponse } = require('../utils/helpers');

// ==================== DASHBOARD ====================

// @desc    Get admin dashboard stats
// @route   GET /api/admin/dashboard
// @access  Private (Admin)
exports.getDashboardStats = async (req, res) => {
    try {
        const [
            totalUsers,
            totalFreelancers,
            totalClients,
            totalJobs,
            openJobs,
            completedJobs,
            totalApplications,
            totalTransactions,
            suspendedUsers
        ] = await Promise.all([
            User.countDocuments({ role: { $ne: 'admin' } }),
            User.countDocuments({ role: 'freelancer' }),
            User.countDocuments({ role: 'client' }),
            Job.countDocuments(),
            Job.countDocuments({ status: 'open' }),
            Job.countDocuments({ status: 'completed' }),
            Application.countDocuments(),
            Transaction.countDocuments({ type: 'payment', status: 'completed' }),
            User.countDocuments({ isSuspended: true })
        ]);

        // Total revenue (commission)
        const revenueResult = await Transaction.aggregate([
            { $match: { type: 'commission', status: 'completed' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const totalRevenue = revenueResult[0]?.total || 0;

        // Recent activity
        const recentJobs = await Job.find()
            .populate('client', 'name')
            .populate('skill', 'name')
            .sort('-createdAt')
            .limit(5);

        const recentUsers = await User.find({ role: { $ne: 'admin' } })
            .select('name email role createdAt')
            .sort('-createdAt')
            .limit(5);

        res.json({
            success: true,
            dashboard: {
                stats: {
                    totalUsers,
                    totalFreelancers,
                    totalClients,
                    totalJobs,
                    openJobs,
                    completedJobs,
                    totalApplications,
                    totalRevenue,
                    suspendedUsers
                },
                recentJobs,
                recentUsers
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ==================== SKILLS ====================

// @desc    Get all skills
// @route   GET /api/admin/skills
// @access  Private (Admin)
exports.getSkills = async (req, res) => {
    try {
        const skills = await Skill.find().sort('name');
        res.json({
            success: true,
            count: skills.length,
            skills
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Create a skill
// @route   POST /api/admin/skills
// @access  Private (Admin)
exports.createSkill = async (req, res) => {
    try {
        const { name, description, icon, category } = req.body;

        const skill = await Skill.create({
            name,
            description,
            icon,
            category
        });

        res.status(201).json({
            success: true,
            message: 'Skill created successfully',
            skill
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Update a skill
// @route   PUT /api/admin/skills/:id
// @access  Private (Admin)
exports.updateSkill = async (req, res) => {
    try {
        const { name, description, icon, category, isActive } = req.body;

        const skill = await Skill.findByIdAndUpdate(
            req.params.id,
            { name, description, icon, category, isActive },
            { new: true, runValidators: true }
        );

        if (!skill) {
            return res.status(404).json({
                success: false,
                message: 'Skill not found'
            });
        }

        res.json({
            success: true,
            message: 'Skill updated successfully',
            skill
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Delete a skill
// @route   DELETE /api/admin/skills/:id
// @access  Private (Admin)
exports.deleteSkill = async (req, res) => {
    try {
        const skill = await Skill.findById(req.params.id);

        if (!skill) {
            return res.status(404).json({
                success: false,
                message: 'Skill not found'
            });
        }

        // Check if skill is being used
        if (skill.freelancerCount > 0 || skill.jobCount > 0) {
            // Soft delete
            skill.isActive = false;
            await skill.save();
            return res.json({
                success: true,
                message: 'Skill deactivated (has associated data)'
            });
        }

        await skill.deleteOne();

        res.json({
            success: true,
            message: 'Skill deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ==================== QUESTIONS ====================

// @desc    Get all questions
// @route   GET /api/admin/questions
// @access  Private (Admin)
exports.getQuestions = async (req, res) => {
    try {
        const { skill, page = 1, limit = 20 } = req.query;

        const query = {};
        if (skill) query.skill = skill;

        const { skip, limit: limitNum } = paginate(page, limit);

        const questions = await Question.find(query)
            .populate('skill', 'name icon')
            .sort('-createdAt')
            .skip(skip)
            .limit(limitNum);

        const total = await Question.countDocuments(query);

        const paginated = paginationResponse(questions, page, limitNum, total);

        res.json({
            success: true,
            questions: paginated.data,
            pagination: paginated.pagination
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Create a question
// @route   POST /api/admin/questions
// @access  Private (Admin)
exports.createQuestion = async (req, res) => {
    try {
        const { skill, question, options, difficulty, explanation, correctAnswer } = req.body;

        let formattedOptions = options;
        if (Array.isArray(options) && typeof options[0] === 'string') {
            formattedOptions = options.map((opt, index) => ({
                text: opt,
                isCorrect: index === parseInt(correctAnswer)
            }));
        }

        const newQuestion = await Question.create({
            skill,
            question,
            options: formattedOptions,
            difficulty,
            explanation
        });

        const populatedQuestion = await Question.findById(newQuestion._id)
            .populate('skill', 'name icon');

        res.status(201).json({
            success: true,
            message: 'Question created successfully',
            question: populatedQuestion
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Update a question
// @route   PUT /api/admin/questions/:id
// @access  Private (Admin)
exports.updateQuestion = async (req, res) => {
    try {
        const { skill, question, options, difficulty, explanation, isActive, correctAnswer } = req.body;

        let formattedOptions = options;
        if (Array.isArray(options) && typeof options[0] === 'string') {
            formattedOptions = options.map((opt, index) => ({
                text: opt,
                isCorrect: index === parseInt(correctAnswer)
            }));
        }

        const updateData = {
            skill,
            question,
            difficulty,
            explanation,
            isActive
        };

        if (formattedOptions) {
            updateData.options = formattedOptions;
        }

        const updatedQuestion = await Question.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        ).populate('skill', 'name icon');

        if (!updatedQuestion) {
            return res.status(404).json({
                success: false,
                message: 'Question not found'
            });
        }

        res.json({
            success: true,
            message: 'Question updated successfully',
            question: updatedQuestion
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Delete a question
// @route   DELETE /api/admin/questions/:id
// @access  Private (Admin)
exports.deleteQuestion = async (req, res) => {
    try {
        const question = await Question.findByIdAndDelete(req.params.id);

        if (!question) {
            return res.status(404).json({
                success: false,
                message: 'Question not found'
            });
        }

        res.json({
            success: true,
            message: 'Question deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ==================== USERS ====================

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin)
exports.getUsers = async (req, res) => {
    try {
        const { role, suspended, search, page = 1, limit = 20 } = req.query;

        const query = { role: { $ne: 'admin' } };
        if (role) query.role = role;
        if (suspended === 'true') query.isSuspended = true;
        if (suspended === 'false') query.isSuspended = false;
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        const { skip, limit: limitNum } = paginate(page, limit);

        const users = await User.find(query)
            .select('-password')
            .populate('skills.skill', 'name icon')
            .sort('-createdAt')
            .skip(skip)
            .limit(limitNum);

        const total = await User.countDocuments(query);

        res.json({
            success: true,
            ...paginationResponse(users, page, limitNum, total)
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Suspend/unsuspend a user
// @route   PUT /api/admin/users/:id/suspend
// @access  Private (Admin)
exports.suspendUser = async (req, res) => {
    try {
        const { suspend, reason } = req.body;

        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (user.role === 'admin') {
            return res.status(400).json({
                success: false,
                message: 'Cannot suspend admin users'
            });
        }

        user.isSuspended = suspend;
        if (suspend) {
            user.suspendedAt = new Date();
            user.suspendedReason = reason || 'Violated platform terms';
        } else {
            user.suspendedAt = null;
            user.suspendedReason = null;
        }

        await user.save();

        res.json({
            success: true,
            message: suspend ? 'User suspended successfully' : 'User unsuspended successfully',
            user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Delete a user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (user.role === 'admin') {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete admin users'
            });
        }

        await user.deleteOne();

        res.json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ==================== QUIZ RESULTS ====================

// @desc    Get quiz results of all freelancers
// @route   GET /api/admin/quiz-results
// @access  Private (Admin)
exports.getQuizResults = async (req, res) => {
    try {
        const { skill, passed, page = 1, limit = 20 } = req.query;

        const query = {};
        if (skill) query.skill = skill;
        if (passed === 'true') query.passed = true;
        if (passed === 'false') query.passed = false;

        const { skip, limit: limitNum } = paginate(page, limit);

        const attempts = await QuizAttempt.find(query)
            .populate('skill', 'name icon')
            .sort('-createdAt')
            .skip(skip)
            .limit(limitNum);

        const total = await QuizAttempt.countDocuments(query);

        res.json({
            success: true,
            ...paginationResponse(attempts, page, limitNum, total)
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ==================== JOBS ====================

// @desc    Get all jobs
// @route   GET /api/admin/jobs
// @access  Private (Admin)
exports.getJobs = async (req, res) => {
    try {
        const { status, skill, page = 1, limit = 20 } = req.query;

        const query = {};
        if (status) query.status = status;
        if (skill) query.skill = skill;

        const { skip, limit: limitNum } = paginate(page, limit);

        const jobs = await Job.find(query)
            .populate('client', 'name email')
            .populate('skill', 'name icon')
            .populate('hiredFreelancer', 'name')
            .sort('-createdAt')
            .skip(skip)
            .limit(limitNum);

        const total = await Job.countDocuments(query);

        res.json({
            success: true,
            ...paginationResponse(jobs, page, limitNum, total)
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Delete a job
// @route   DELETE /api/admin/jobs/:id
// @access  Private (Admin)
exports.deleteJob = async (req, res) => {
    try {
        const job = await Job.findByIdAndDelete(req.params.id);

        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job not found'
            });
        }

        // Decrement job count for skill
        await Skill.findByIdAndUpdate(job.skill, {
            $inc: { jobCount: -1 }
        });

        res.json({
            success: true,
            message: 'Job deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ==================== COMMISSIONS ====================

// @desc    Get commission logs
// @route   GET /api/admin/commissions
// @access  Private (Admin)
exports.getCommissions = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;

        const { skip, limit: limitNum } = paginate(page, limit);

        const commissions = await Transaction.find({ type: 'commission' })
            .populate('from', 'name email')
            .populate('job', 'title')
            .sort('-createdAt')
            .skip(skip)
            .limit(limitNum);

        const total = await Transaction.countDocuments({ type: 'commission' });

        // Total commission earned
        const totalResult = await Transaction.aggregate([
            { $match: { type: 'commission', status: 'completed' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        res.json({
            success: true,
            totalCommission: totalResult[0]?.total || 0,
            ...paginationResponse(commissions, page, limitNum, total)
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ==================== SETTINGS ====================

// @desc    Get all admin settings
// @route   GET /api/admin/settings
// @access  Private (Admin)
exports.getSettings = async (req, res) => {
    try {
        const settings = await AdminSettings.find().sort('category');
        res.json({
            success: true,
            settings
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Update a setting
// @route   PUT /api/admin/settings/:key
// @access  Private (Admin)
exports.updateSetting = async (req, res) => {
    try {
        const { value } = req.body;

        const setting = await AdminSettings.findOneAndUpdate(
            { key: req.params.key },
            { value, updatedBy: req.user._id },
            { new: true }
        );

        if (!setting) {
            return res.status(404).json({
                success: false,
                message: 'Setting not found'
            });
        }

        res.json({
            success: true,
            message: 'Setting updated successfully',
            setting
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
