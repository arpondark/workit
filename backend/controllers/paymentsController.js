const Transaction = require('../models/Transaction');
const Job = require('../models/Job');
const User = require('../models/User');
const Application = require('../models/Application');
const AdminSettings = require('../models/AdminSettings');
const { calculateCommission, paginate, paginationResponse } = require('../utils/helpers');

// @desc    Make a payment for a job (dummy payment)
// @route   POST /api/payments/pay
// @access  Private (Client)
exports.processPayment = async (req, res) => {
    try {
        const { jobId, amount, paymentMethod = 'platform' } = req.body;

        // Verify job
        const job = await Job.findById(jobId).populate('hiredFreelancer');

        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job not found'
            });
        }

        if (job.client.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to make payment for this job'
            });
        }

        if (!job.hiredFreelancer) {
            return res.status(400).json({
                success: false,
                message: 'No freelancer hired for this job'
            });
        }

        if (job.status === 'completed') {
            return res.status(400).json({
                success: false,
                message: 'Payment already completed for this job'
            });
        }

        // Get commission rate from settings
        const commissionSetting = await AdminSettings.findOne({ key: 'commission_rate' });
        const commissionRate = commissionSetting ? commissionSetting.value : 0.01;

        // Calculate amounts
        const { commission, netAmount } = calculateCommission(amount, commissionRate);

        // Create payment transaction
        const paymentTransaction = await Transaction.create({
            type: 'payment',
            amount,
            from: req.user._id,
            to: job.hiredFreelancer._id,
            job: jobId,
            description: `Payment for job: ${job.title}`,
            commission,
            commissionRate,
            netAmount,
            paymentMethod,
            status: 'completed',
            completedAt: new Date()
        });

        // Create commission transaction
        await Transaction.create({
            type: 'commission',
            amount: commission,
            from: job.hiredFreelancer._id,
            job: jobId,
            description: `Platform commission (${commissionRate * 100}%) for job: ${job.title}`,
            status: 'completed',
            completedAt: new Date()
        });

        // Update freelancer balance
        await User.findByIdAndUpdate(job.hiredFreelancer._id, {
            $inc: {
                totalEarnings: netAmount,
                availableBalance: netAmount,
                completedJobs: 1
            }
        });

        // Update job status
        job.status = 'completed';
        job.completedAt = new Date();
        await job.save();

        res.json({
            success: true,
            message: 'Payment successful',
            transaction: {
                transactionId: paymentTransaction.transactionId,
                amount,
                commission,
                netAmount,
                freelancerReceives: netAmount
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Withdraw funds (dummy withdrawal)
// @route   POST /api/payments/withdraw
// @access  Private (Freelancer)
exports.withdrawFunds = async (req, res) => {
    try {
        const { amount, paymentMethod = 'bank' } = req.body;

        if (amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid amount'
            });
        }

        // Calculate available balance from completed jobs
        const completedApps = await Application.find({
            freelancer: req.user._id,
            status: 'accepted'
        }).populate('job', 'status budget');

        // Calculate total earned from completed jobs (99% after 1% platform fee)
        const totalEarned = completedApps.reduce((sum, app) => {
            if (app.job?.status === 'completed') {
                const budget = app.proposedBudget || 0;
                return sum + (budget * 0.99);
            }
            return sum;
        }, 0);

        // Get total already withdrawn
        const totalWithdrawn = await Transaction.aggregate([
            {
                $match: {
                    from: req.user._id,
                    type: 'withdrawal',
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

        const withdrawnAmount = totalWithdrawn[0]?.total || 0;
        const availableBalance = totalEarned - withdrawnAmount;

        if (amount > availableBalance) {
            return res.status(400).json({
                success: false,
                message: `Insufficient balance. Available: $${availableBalance.toFixed(2)}`
            });
        }

        // Create withdrawal transaction with PENDING status - requires admin approval
        const transaction = await Transaction.create({
            type: 'withdrawal',
            amount,
            from: req.user._id,
            description: `Withdrawal request to ${paymentMethod}`,
            paymentMethod,
            status: 'pending', // Pending admin approval
            metadata: {
                bankDetails: JSON.stringify(req.body.bankDetails || {})
            }
        });

        // DO NOT update user balance here - only update when admin approves

        res.json({
            success: true,
            message: 'Withdrawal request submitted. Pending admin approval.',
            transaction: {
                transactionId: transaction.transactionId,
                amount,
                status: 'pending'
            }
        });
    } catch (error) {
        console.error('Withdrawal Error:', error.message, error.stack);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get user transactions
// @route   GET /api/payments/transactions
// @access  Private
exports.getTransactions = async (req, res) => {
    try {
        const { type, status, page = 1, limit = 10 } = req.query;

        const query = {
            $or: [
                { from: req.user._id },
                { to: req.user._id }
            ]
        };

        if (type) query.type = type;
        if (status) query.status = status;

        const { skip, limit: limitNum } = paginate(page, limit);

        const transactions = await Transaction.find(query)
            .populate('from', 'name avatar')
            .populate('to', 'name avatar')
            .populate('job', 'title')
            .sort('-createdAt')
            .skip(skip)
            .limit(limitNum);

        const total = await Transaction.countDocuments(query);

        res.json({
            success: true,
            ...paginationResponse(transactions, page, limitNum, total)
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get freelancer earnings summary
// @route   GET /api/payments/earnings
// @access  Private (Freelancer)
exports.getEarnings = async (req, res) => {
    try {
        const totalEarned = await Transaction.aggregate([
            {
                $match: {
                    to: req.user._id,
                    type: 'payment',
                    status: 'completed'
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$netAmount' },
                    count: { $sum: 1 }
                }
            }
        ]);

        // Total withdrawn (Completed AND Pending) to show accurate available balance
        const totalWithdrawn = await Transaction.aggregate([
            {
                $match: {
                    from: req.user._id,
                    type: 'withdrawal',
                    status: { $in: ['completed', 'pending'] }
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$amount' }
                }
            }
        ]);

        const withdrawnAmount = totalWithdrawn[0]?.total || 0;
        
        // Use User model's totalEarnings (Lifetime)
        const lifetimeEarnings = req.user.totalEarnings || 0;
        
        // Calculate available balance
        const availableBalance = lifetimeEarnings - withdrawnAmount;

        const pendingPayments = await Transaction.aggregate([
            {
                $match: {
                    to: req.user._id,
                    type: 'payment',
                    status: 'pending'
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$netAmount' }
                }
            }
        ]);

        // Monthly earnings for the last 6 months
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const monthlyEarnings = await Transaction.aggregate([
            {
                $match: {
                    to: req.user._id,
                    type: 'payment',
                    status: 'completed',
                    completedAt: { $gte: sixMonthsAgo }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$completedAt' },
                        month: { $month: '$completedAt' }
                    },
                    total: { $sum: '$netAmount' },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        res.json({
            success: true,
            earnings: {
                totalEarned: lifetimeEarnings, // Use lifetime from User model
                completedJobs: req.user.completedJobs || 0,
                totalWithdrawn: withdrawnAmount,
                pendingPayments: pendingPayments[0]?.total || 0,
                availableBalance: availableBalance, // Calculated on the fly
                monthlyEarnings
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
