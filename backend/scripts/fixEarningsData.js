const mongoose = require('mongoose');
const User = require('../models/User');
const Application = require('../models/Application');
const Transaction = require('../models/Transaction');
const Job = require('../models/Job');
require('dotenv').config();

// Fix earnings data for all users
async function fixEarningsData() {
    try {
        console.log('Starting earnings data fix...');

        // Get all freelancers
        const freelancers = await User.find({ role: 'freelancer' });
        console.log(`Found ${freelancers.length} freelancers to process`);

        for (const freelancer of freelancers) {
            console.log(`Processing freelancer: ${freelancer.name} (${freelancer._id})`);

            // Get completed applications for this freelancer
            const completedApps = await Application.find({
                freelancer: freelancer._id,
                status: 'accepted'
            }).populate('job', 'status');

            // Calculate total earnings from completed jobs (99% after 1% platform fee)
            const totalEarned = completedApps.reduce((sum, app) => {
                if (app.job?.status === 'completed') {
                    const budget = app.proposedBudget || 0;
                    return sum + (budget * 0.99);
                }
                return sum;
            }, 0);

            // Get total already withdrawn (completed withdrawals only)
            const withdrawnResult = await Transaction.aggregate([
                {
                    $match: {
                        from: freelancer._id,
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

            const withdrawnAmount = withdrawnResult[0]?.total || 0;
            const availableBalance = totalEarned - withdrawnAmount;

            // Get completed jobs count
            const completedJobsCount = completedApps.filter(app => 
                app.job?.status === 'completed'
            ).length;

            console.log(`  - Total Earned: $${totalEarned.toFixed(2)}`);
            console.log(`  - Withdrawn: $${withdrawnAmount.toFixed(2)}`);
            console.log(`  - Available: $${availableBalance.toFixed(2)}`);
            console.log(`  - Completed Jobs: ${completedJobsCount}`);

            // Update user record
            await User.findByIdAndUpdate(freelancer._id, {
                totalEarnings: totalEarned,
                availableBalance: availableBalance,
                completedJobs: completedJobsCount
            });

            console.log(`  ✓ Updated user record`);
        }

        console.log('✅ Earnings data fix completed successfully!');
    } catch (error) {
        console.error('❌ Error fixing earnings data:', error);
    } finally {
        await mongoose.disconnect();
    }
}

// Connect to database and run the fix
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/workit').then(() => {
    fixEarningsData();
}).catch(error => {
    console.error('Database connection error:', error);
    process.exit(1);
});