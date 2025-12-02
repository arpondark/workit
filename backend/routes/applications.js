const express = require('express');
const router = express.Router();
const Application = require('../models/Application');
const Job = require('../models/Job');
const User = require('../models/User');
const Chat = require('../models/Chat');
const Message = require('../models/Message');
const { protect, authorize } = require('../middleware/auth');
const { paginate, paginationResponse } = require('../utils/helpers');

// @route   POST /api/applications
// @desc    Apply for a job
// @access  Private (Freelancer)
router.post('/', protect, authorize('freelancer'), async (req, res) => {
    try {
        const { jobId, coverLetter, proposedBudget, estimatedDuration } = req.body;

        // Check if job exists and is open
        const job = await Job.findById(jobId).populate('skill');
        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job not found'
            });
        }

        if (job.status !== 'open') {
            return res.status(400).json({
                success: false,
                message: 'This job is no longer accepting applications'
            });
        }

        // Check if freelancer is suspended
        if (req.user.isSuspended) {
            return res.status(403).json({
                success: false,
                message: 'Your account is suspended. You cannot apply for jobs.'
            });
        }

        // Check if freelancer has passed the skill test for this job's skill
        const hasSkill = req.user.skills.some(
            s => s.skill.toString() === job.skill._id.toString() && s.passed
        );

        if (!hasSkill) {
            return res.status(403).json({
                success: false,
                message: `You must pass the ${job.skill.name} skill test before applying for this job.`
            });
        }

        // Check if already applied
        const existingApplication = await Application.findOne({
            job: jobId,
            freelancer: req.user._id
        });

        if (existingApplication) {
            return res.status(400).json({
                success: false,
                message: 'You have already applied for this job'
            });
        }

        // Create application
        const application = await Application.create({
            job: jobId,
            freelancer: req.user._id,
            coverLetter,
            proposedBudget,
            estimatedDuration
        });

        // Increment applications count
        job.applicationsCount += 1;
        await job.save();

        const populatedApplication = await Application.findById(application._id)
            .populate('job', 'title')
            .populate('freelancer', 'name avatar');

        res.status(201).json({
            success: true,
            message: 'Application submitted successfully',
            application: populatedApplication
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   GET /api/applications/freelancer/my-applications
// @desc    Get all applications by current freelancer
// @access  Private (Freelancer)
router.get('/freelancer/my-applications', protect, authorize('freelancer'), async (req, res) => {
    try {
        const { status, page = 1, limit = 10 } = req.query;

        const query = { freelancer: req.user._id };
        if (status) query.status = status;

        const { skip, limit: limitNum } = paginate(page, limit);

        const applications = await Application.find(query)
            .populate({
                path: 'job',
                select: 'title description budget status skill client',
                populate: [
                    { path: 'skill', select: 'name icon' },
                    { path: 'client', select: 'name avatar' }
                ]
            })
            .sort('-createdAt')
            .skip(skip)
            .limit(limitNum);

        const total = await Application.countDocuments(query);

        res.json({
            success: true,
            ...paginationResponse(applications, page, limitNum, total)
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   GET /api/applications/:id
// @desc    Get single application
// @access  Private
router.get('/:id', protect, async (req, res) => {
    try {
        const application = await Application.findById(req.params.id)
            .populate({
                path: 'job',
                populate: [
                    { path: 'skill', select: 'name icon' },
                    { path: 'client', select: 'name avatar email' }
                ]
            })
            .populate({
                path: 'freelancer',
                select: 'name avatar bio skills rating reviewCount completedJobs',
                populate: { path: 'skills.skill', select: 'name icon' }
            });

        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Application not found'
            });
        }

        // Only allow freelancer (applicant) or client (job owner) to view
        const isFreelancer = application.freelancer._id.toString() === req.user._id.toString();
        const isClient = application.job.client._id.toString() === req.user._id.toString();
        const isAdmin = req.user.role === 'admin';

        if (!isFreelancer && !isClient && !isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view this application'
            });
        }

        res.json({
            success: true,
            application
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   PUT /api/applications/:id/status
// @desc    Update application status (accept/reject/shortlist)
// @access  Private (Client - job owner only)
router.put('/:id/status', protect, authorize('client'), async (req, res) => {
    try {
        const { status, notes } = req.body;

        if (!['shortlisted', 'accepted', 'rejected'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status'
            });
        }

        const application = await Application.findById(req.params.id)
            .populate('job');

        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Application not found'
            });
        }

        // Check ownership
        if (application.job.client.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this application'
            });
        }

        // Update application
        application.status = status;
        if (notes) application.clientNotes = notes;
        
        if (status === 'accepted') {
            application.acceptedAt = new Date();
            
            // Update job status and hire freelancer
            await Job.findByIdAndUpdate(application.job._id, {
                status: 'in-progress',
                hiredFreelancer: application.freelancer,
                hiredAt: new Date()
            });

            // Reject other applications
            await Application.updateMany(
                { 
                    job: application.job._id, 
                    _id: { $ne: application._id },
                    status: { $nin: ['rejected', 'withdrawn'] }
                },
                { status: 'rejected', rejectedAt: new Date() }
            );

            // Create chat between client and freelancer
            const existingChat = await Chat.findOne({
                participants: { $all: [req.user._id, application.freelancer] }
            });

            if (!existingChat) {
                const chat = await Chat.create({
                    participants: [req.user._id, application.freelancer],
                    job: application.job._id
                });

                // Send system message
                await Message.create({
                    chat: chat._id,
                    sender: req.user._id,
                    content: `You've been hired for the job: ${application.job.title}`,
                    type: 'system'
                });
            }
        } else if (status === 'rejected') {
            application.rejectedAt = new Date();
        }

        await application.save();

        res.json({
            success: true,
            message: `Application ${status} successfully`,
            application
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   PUT /api/applications/:id/withdraw
// @desc    Withdraw application
// @access  Private (Freelancer - applicant only)
router.put('/:id/withdraw', protect, authorize('freelancer'), async (req, res) => {
    try {
        const application = await Application.findById(req.params.id);

        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Application not found'
            });
        }

        if (application.freelancer.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to withdraw this application'
            });
        }

        if (application.status === 'accepted') {
            return res.status(400).json({
                success: false,
                message: 'Cannot withdraw an accepted application'
            });
        }

        application.status = 'withdrawn';
        await application.save();

        // Decrement applications count
        await Job.findByIdAndUpdate(application.job, {
            $inc: { applicationsCount: -1 }
        });

        res.json({
            success: true,
            message: 'Application withdrawn successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;
