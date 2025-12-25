const User = require('../models/User');
const Skill = require('../models/Skill');
const Question = require('../models/Question');
const Job = require('../models/Job');
const Application = require('../models/Application');
const Transaction = require('../models/Transaction');
const QuizAttempt = require('../models/QuizAttempt');
const AdminSettings = require('../models/AdminSettings');
const Message = require('../models/Message');
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
            suspendedUsers,
            totalQuizAttempts,
            totalPassedQuizzes
        ] = await Promise.all([
            User.countDocuments({ role: { $ne: 'admin' } }),
            User.countDocuments({ role: 'freelancer' }),
            User.countDocuments({ role: 'client' }),
            Job.countDocuments(),
            Job.countDocuments({ status: 'open' }),
            Job.countDocuments({ status: 'completed' }),
            Application.countDocuments(),
            Transaction.countDocuments({ type: 'payment', status: 'completed' }),
            User.countDocuments({ isSuspended: true }),
            QuizAttempt.countDocuments(),
            QuizAttempt.countDocuments({ passed: true })
        ]);

        // Total revenue from commission transactions
        const revenueResult = await Transaction.aggregate([
            { $match: { type: 'commission', status: 'completed' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        let totalRevenue = revenueResult[0]?.total || 0;

        // If no transaction-based revenue, calculate from completed jobs (1% platform fee)
        if (totalRevenue === 0 && completedJobs > 0) {
            const completedJobsWithApps = await Application.find({ status: 'accepted' })
                .populate('job', 'status budget');

            totalRevenue = completedJobsWithApps.reduce((sum, app) => {
                if (app.job?.status === 'completed') {
                    const budget = app.proposedBudget || app.job?.budget?.max || 0;
                    return sum + (budget * 0.01); // 1% platform fee
                }
                return sum;
            }, 0);
        }

        // Calculate pass rate
        const quizPassRate = totalQuizAttempts > 0
            ? Math.round((totalPassedQuizzes / totalQuizAttempts) * 100)
            : 0;

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
                    suspendedUsers,
                    totalQuizAttempts,
                    quizPassRate
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

        // Convert to frontend format (strings array + correctAnswer index)
        const frontendQuestions = questions.map(q => {
            const questionObj = q.toObject();
            const optionsArray = questionObj.options || [];
            const options = optionsArray.map(opt => opt.text);
            const correctAnswer = optionsArray.findIndex(opt => opt.isCorrect);

            return {
                ...questionObj,
                options,
                correctAnswer
            };
        });

        const paginated = paginationResponse(frontendQuestions, page, limitNum, total);

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

        // Convert to frontend format
        const optionsArray = populatedQuestion.toObject().options || [];
        const frontendQuestion = {
            ...populatedQuestion.toObject(),
            options: optionsArray.map(opt => opt.text),
            correctAnswer: optionsArray.findIndex(opt => opt.isCorrect)
        };

        res.status(201).json({
            success: true,
            message: 'Question created successfully',
            question: frontendQuestion
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

        // Convert to frontend format
        const optionsArray = updatedQuestion.toObject().options || [];
        const frontendQuestion = {
            ...updatedQuestion.toObject(),
            options: optionsArray.map(opt => opt.text),
            correctAnswer: optionsArray.findIndex(opt => opt.isCorrect)
        };

        res.json({
            success: true,
            message: 'Question updated successfully',
            question: frontendQuestion
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

        // Get stats for frontend
        const totalClients = await User.countDocuments({ role: 'client' });
        const totalFreelancers = await User.countDocuments({ role: 'freelancer' });
        const totalSuspended = await User.countDocuments({ isSuspended: true });

        res.json({
            success: true,
            ...paginationResponse(users, page, limitNum, total),
            totalClients,
            totalFreelancers,
            totalSuspended
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

// ==================== TRANSACTIONS ====================

// @desc    Get all transactions
// @route   GET /api/admin/transactions
// @access  Private (Admin)
exports.getTransactions = async (req, res) => {
    try {
        const { type, status, page = 1, limit = 20 } = req.query;

        const query = {};
        if (type) query.type = type;
        if (status) query.status = status;

        const { skip, limit: limitNum } = paginate(page, limit);

        const transactions = await Transaction.find(query)
            .populate('from', 'name email')
            .populate('to', 'name email')
            .populate('job', 'title')
            .sort('-createdAt')
            .skip(skip)
            .limit(limitNum);

        const total = await Transaction.countDocuments(query);

        res.json({
            success: true,
            transactions,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limitNum)
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get transaction stats
// @route   GET /api/admin/transactions/stats
// @access  Private (Admin)
exports.getTransactionStats = async (req, res) => {
    try {
        // Total volume
        const volumeResult = await Transaction.aggregate([
            { $match: { status: 'completed' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const totalVolume = volumeResult[0]?.total || 0;

        // Platform revenue (commissions)
        const revenueResult = await Transaction.aggregate([
            { $match: { type: 'commission', status: 'completed' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const platformRevenue = revenueResult[0]?.total || 0;

        // This month volume
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const monthlyResult = await Transaction.aggregate([
            { $match: { status: 'completed', createdAt: { $gte: startOfMonth } } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const monthlyVolume = monthlyResult[0]?.total || 0;

        // Total transactions
        const totalTransactions = await Transaction.countDocuments();

        res.json({
            success: true,
            totalVolume,
            platformRevenue,
            monthlyVolume,
            totalTransactions
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

// @desc    Update settings (bulk)
// @route   PUT /api/admin/settings
// @access  Private (Admin)
exports.updateSettings = async (req, res) => {
    try {
        const updates = req.body;
        const results = [];

        for (const [key, value] of Object.entries(updates)) {
            const setting = await AdminSettings.findOneAndUpdate(
                { key },
                {
                    value,
                    updatedBy: req.user._id,
                    // Set category based on key prefix or known keys if needed, 
                    // but for now we assume keys already exist or we just update value
                },
                { new: true, upsert: true }
            );
            results.push(setting);
        }

        res.json({
            success: true,
            message: 'Settings updated successfully',
            settings: results
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
// ==================== DANGER ZONE ====================

// @desc    Reset all quiz attempts
// @route   POST /api/admin/reset-quiz-attempts
// @access  Private (Admin)
exports.resetQuizAttempts = async (req, res) => {
    try {
        await QuizAttempt.deleteMany({});

        // Also reset user skills status if needed, but for now just clearing attempts
        // Ideally we might want to reset 'passed' status on users too, but that's more complex

        res.json({
            success: true,
            message: 'All quiz attempts have been reset'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Clear all messages
// @route   POST /api/admin/clear-messages
// @access  Private (Admin)
exports.clearAllMessages = async (req, res) => {
    try {
        await Message.deleteMany({});

        res.json({
            success: true,
            message: 'All messages have been cleared'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ==================== WITHDRAWAL REQUESTS ====================

// @desc    Get all pending withdrawal requests
// @route   GET /api/admin/withdrawals
// @access  Private (Admin)
exports.getWithdrawalRequests = async (req, res) => {
    try {
        const { status = 'pending', page = 1, limit = 20 } = req.query;

        const query = { type: 'withdrawal' };
        if (status && status !== 'all') {
            query.status = status;
        }

        const { skip, limit: limitNum } = paginate(page, limit);

        const withdrawals = await Transaction.find(query)
            .populate('from', 'name email')
            .sort('-createdAt')
            .skip(skip)
            .limit(limitNum);

        const total = await Transaction.countDocuments(query);
        const pendingCount = await Transaction.countDocuments({ type: 'withdrawal', status: 'pending' });

        res.json({
            success: true,
            ...paginationResponse(withdrawals, page, limitNum, total),
            pendingCount
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Approve a withdrawal request
// @route   PUT /api/admin/withdrawals/:id/approve
// @access  Private (Admin)
exports.approveWithdrawal = async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id).populate('from', 'name email availableBalance');

        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: 'Withdrawal request not found'
            });
        }

        if (transaction.type !== 'withdrawal') {
            return res.status(400).json({
                success: false,
                message: 'This is not a withdrawal request'
            });
        }

        if (transaction.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: `Withdrawal already ${transaction.status}`
            });
        }

        // Mark as completed
        transaction.status = 'completed';
        transaction.completedAt = new Date();
        await transaction.save();

        // Note: Balance tracking is now handled via completed jobs calculation
        // No need to update user.availableBalance since we calculate from completed apps

        res.json({
            success: true,
            message: 'Withdrawal approved successfully',
            transaction
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Reject a withdrawal request
// @route   PUT /api/admin/withdrawals/:id/reject
// @access  Private (Admin)
exports.rejectWithdrawal = async (req, res) => {
    try {
        const { reason } = req.body;
        const transaction = await Transaction.findById(req.params.id);

        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: 'Withdrawal request not found'
            });
        }

        if (transaction.type !== 'withdrawal') {
            return res.status(400).json({
                success: false,
                message: 'This is not a withdrawal request'
            });
        }

        if (transaction.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: `Withdrawal already ${transaction.status}`
            });
        }

        // Mark as failed/rejected
        transaction.status = 'failed';
        transaction.failedAt = new Date();
        transaction.failureReason = reason || 'Rejected by admin';
        await transaction.save();

        res.json({
            success: true,
            message: 'Withdrawal rejected',
            transaction
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
