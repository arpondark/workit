const Job = require('../models/Job');
const Application = require('../models/Application');
const Skill = require('../models/Skill');
const AdminSettings = require('../models/AdminSettings');
const { paginate, paginationResponse } = require('../utils/helpers');

// @desc    Get all jobs with filters
// @route   GET /api/jobs
// @access  Public
exports.getJobs = async (req, res) => {
    try {
        const {
            skill, status, budget_min, budget_max,
            duration, experience, search,
            page = 1, limit = 10, sort = '-createdAt'
        } = req.query;

        // Build query
        const query = { isActive: true, status: 'open' };

        if (skill) query.skill = skill;
        if (status) query.status = status;
        if (duration) query.duration = duration;
        if (experience) query.experienceLevel = experience;

        if (budget_min || budget_max) {
            query['budget.min'] = {};
            if (budget_min) query['budget.min'].$gte = parseInt(budget_min);
            if (budget_max) query['budget.max'] = { $lte: parseInt(budget_max) };
        }

        if (search) {
            query.$text = { $search: search };
        }

        // Pagination
        const { skip, limit: limitNum } = paginate(page, limit);

        // Execute query
        const jobs = await Job.find(query)
            .populate('client', 'name avatar')
            .populate('skill', 'name icon')
            .sort(sort)
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

// @desc    Get single job
// @route   GET /api/jobs/:id
// @access  Public
exports.getJob = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id)
            .populate('client', 'name avatar email createdAt')
            .populate('skill', 'name icon')
            .populate('hiredFreelancer', 'name avatar rating');

        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job not found'
            });
        }

        // Increment view count
        job.views += 1;
        await job.save();

        res.json({
            success: true,
            job
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Create a new job
// @route   POST /api/jobs
// @access  Private (Client)
exports.createJob = async (req, res) => {
    try {
        const {
            title, description, skill, budget,
            duration, experienceLevel, requirements, deadline
        } = req.body;

        // Verify skill exists
        const skillExists = await Skill.findById(skill);
        if (!skillExists) {
            return res.status(400).json({
                success: false,
                message: 'Invalid skill category'
            });
        }

        const job = await Job.create({
            title,
            description,
            client: req.user._id,
            skill,
            budget,
            duration,
            experienceLevel,
            requirements,
            deadline
        });

        // Increment job count for skill
        await Skill.findByIdAndUpdate(skill, {
            $inc: { jobCount: 1 }
        });

        const populatedJob = await Job.findById(job._id)
            .populate('client', 'name avatar')
            .populate('skill', 'name icon');

        res.status(201).json({
            success: true,
            message: 'Job posted successfully',
            job: populatedJob
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Update a job
// @route   PUT /api/jobs/:id
// @access  Private (Client - owner only)
exports.updateJob = async (req, res) => {
    try {
        let job = await Job.findById(req.params.id);

        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job not found'
            });
        }

        // Check ownership
        if (job.client.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this job'
            });
        }

        // Can't update if job is in progress or completed
        if (['in-progress', 'completed'].includes(job.status)) {
            return res.status(400).json({
                success: false,
                message: 'Cannot update job that is in progress or completed'
            });
        }

        const allowedUpdates = [
            'title', 'description', 'budget', 'duration',
            'experienceLevel', 'requirements', 'deadline', 'isActive', 'status'
        ];

        const updates = {};
        Object.keys(req.body).forEach(key => {
            if (allowedUpdates.includes(key)) {
                updates[key] = req.body[key];
            }
        });

        job = await Job.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true, runValidators: true }
        )
            .populate('client', 'name avatar')
            .populate('skill', 'name icon');

        res.json({
            success: true,
            message: 'Job updated successfully',
            job
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Delete a job
// @route   DELETE /api/jobs/:id
// @access  Private (Client - owner only)
exports.deleteJob = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);

        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job not found'
            });
        }

        // Check ownership (unless admin)
        if (req.user.role !== 'admin' && job.client.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this job'
            });
        }

        // Hard delete - actually remove the job from database
        await Job.findByIdAndDelete(req.params.id);

        // Also delete associated applications
        const Application = require('../models/Application');
        await Application.deleteMany({ job: req.params.id });

        // Decrement job count for skill
        await Skill.findByIdAndUpdate(job.skill, {
            $inc: { jobCount: -1 }
        });

        res.json({
            success: true,
            message: 'Job deleted permanently'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get all jobs posted by current client
// @route   GET /api/jobs/client/my-jobs
// @access  Private (Client)
exports.getMyJobs = async (req, res) => {
    try {
        const { status, page = 1, limit = 10 } = req.query;

        const query = { client: req.user._id };
        if (status) query.status = status;

        const { skip, limit: limitNum } = paginate(page, limit);

        const jobs = await Job.find(query)
            .populate('skill', 'name icon')
            .populate('hiredFreelancer', 'name avatar')
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

// @desc    Get all applications for a job
// @route   GET /api/jobs/:id/applications
// @access  Private (Client - owner only)
exports.getJobApplications = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);

        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job not found'
            });
        }

        if (job.client.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view applications for this job'
            });
        }

        const applications = await Application.find({ job: req.params.id })
            .populate({
                path: 'freelancer',
                select: 'name avatar bio skills rating reviewCount completedJobs hourlyRate',
                populate: { path: 'skills.skill', select: 'name icon' }
            })
            .sort('-createdAt');

        // Get quiz settings
        const questionsCountSetting = await AdminSettings.findOne({ key: 'quiz_questions_count' });
        const quizSettings = {
            questionsCount: questionsCountSetting ? questionsCountSetting.value : 10
        };

        // Process applications to add quiz score
        const processedApplications = applications.map(app => {
            const appObj = app.toObject();
            if (app.freelancer && app.freelancer.skills) {
                const scores = app.freelancer.skills
                    .map(s => s.quizScore || 0)
                    .filter(s => s > 0);
                appObj.freelancer.quizScore = scores.length > 0 ? Math.max(...scores) : 0;
            } else {
                if (appObj.freelancer) appObj.freelancer.quizScore = 0;
            }
            return appObj;
        });

        res.json({
            success: true,
            count: processedApplications.length,
            applications: processedApplications,
            quizSettings
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Submit work for a job
// @route   POST /api/jobs/:id/submit
// @access  Private (Freelancer - hired only)
exports.submitWork = async (req, res) => {
    try {
        const { description, attachments } = req.body;

        const job = await Job.findById(req.params.id);

        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job not found'
            });
        }

        // Verify authentication
        if (job.hiredFreelancer.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to submit work for this job'
            });
        }

        if (job.status !== 'in-progress') {
            return res.status(400).json({
                success: false,
                message: 'Job is not in progress'
            });
        }

        // Update submission
        job.submission = {
            description,
            attachments: attachments || [],
            submittedAt: new Date(),
            status: 'pending'
        };

        // Notify client? (Could use socket here too eventually)

        await job.save();

        res.json({
            success: true,
            message: 'Work submitted successfully',
            job
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Complete job and release payment
// @route   POST /api/jobs/:id/complete
// @access  Private (Client - owner only)
exports.completeJob = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);

        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job not found'
            });
        }

        // Verify ownership
        if (job.client.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to complete this job'
            });
        }

        if (job.status !== 'in-progress') {
            return res.status(400).json({
                success: false,
                message: 'Job is not in progress'
            });
        }

        if (job.submission.status !== 'pending' && !req.query.force) {
            // Optional: require submission first? 
            // The prompt implies "verify and release".
            // If no submission, maybe client can still complete? 
            // Logic: If submission exists, approve it.
        }

        // Update job status
        job.status = 'completed';
        job.completedAt = new Date();
        job.paymentStatus = 'released';

        if (job.submission) {
            job.submission.status = 'approved';
        }

        await job.save();

        res.json({
            success: true,
            message: 'Job completed and payment released',
            job
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
