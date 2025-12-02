const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const Application = require('../models/Application');
const Skill = require('../models/Skill');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');
const { paginate, paginationResponse } = require('../utils/helpers');

// @route   GET /api/jobs
// @desc    Get all jobs with filters
// @access  Public
router.get('/', async (req, res) => {
    try {
        const { 
            skill, status, budget_min, budget_max, 
            duration, experience, search, 
            page = 1, limit = 10, sort = '-createdAt' 
        } = req.query;

        // Build query
        const query = { isActive: true };

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
});

// @route   GET /api/jobs/:id
// @desc    Get single job
// @access  Public
router.get('/:id', async (req, res) => {
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
});

// @route   POST /api/jobs
// @desc    Create a new job
// @access  Private (Client)
router.post('/', protect, authorize('client'), async (req, res) => {
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
});

// @route   PUT /api/jobs/:id
// @desc    Update a job
// @access  Private (Client - owner only)
router.put('/:id', protect, authorize('client'), async (req, res) => {
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
            'experienceLevel', 'requirements', 'deadline', 'isActive'
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
});

// @route   DELETE /api/jobs/:id
// @desc    Delete a job
// @access  Private (Client - owner only)
router.delete('/:id', protect, authorize('client', 'admin'), async (req, res) => {
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

        // Soft delete - just mark as inactive
        job.isActive = false;
        job.status = 'cancelled';
        await job.save();

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
});

// @route   GET /api/jobs/client/my-jobs
// @desc    Get all jobs posted by current client
// @access  Private (Client)
router.get('/client/my-jobs', protect, authorize('client'), async (req, res) => {
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
});

// @route   GET /api/jobs/:id/applications
// @desc    Get all applications for a job
// @access  Private (Client - owner only)
router.get('/:id/applications', protect, authorize('client'), async (req, res) => {
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

        res.json({
            success: true,
            count: applications.length,
            applications
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;
