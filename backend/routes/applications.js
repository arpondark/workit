const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
    applyForJob,
    getMyApplications,
    getApplication,
    updateApplicationStatus,
    withdrawApplication
} = require('../controllers/applicationsController');

// @route   POST /api/applications
// @desc    Apply for a job
// @access  Private (Freelancer)
router.post('/', protect, authorize('freelancer'), applyForJob);

// @route   POST /api/applications/:jobId
// @desc    Apply for a job (jobId from URL)
// @access  Private (Freelancer)
router.post('/:jobId', protect, authorize('freelancer'), applyForJob);

// @route   GET /api/applications/freelancer/my-applications
// @desc    Get all applications by current freelancer
// @access  Private (Freelancer)
router.get('/freelancer/my-applications', protect, authorize('freelancer'), getMyApplications);

// @route   GET /api/applications/:id
// @desc    Get single application
// @access  Private
router.get('/:id', protect, getApplication);

// @route   PUT /api/applications/:id/status
// @desc    Update application status (accept/reject/shortlist)
// @access  Private (Client - job owner only)
router.put('/:id/status', protect, authorize('client'), updateApplicationStatus);

// @route   PUT /api/applications/:id/withdraw
// @desc    Withdraw application
// @access  Private (Freelancer - applicant only)
router.put('/:id/withdraw', protect, authorize('freelancer'), withdrawApplication);

module.exports = router;
