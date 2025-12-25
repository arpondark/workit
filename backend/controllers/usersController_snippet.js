
// @desc    Get client dashboard stats
// @route   GET /api/users/client/stats
// @access  Private (Client)
exports.getClientDashboardStats = async (req, res) => {
    try {
        const jobs = await Job.find({ client: req.user._id });
        
        const activeJobs = jobs.filter(j => j.status === 'in-progress' || j.status === 'open').length;
        const completedJobs = jobs.filter(j => j.status === 'completed').length;
        const pendingApplications = 0; // Keeping simple, or could aggregate application counts
        
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
