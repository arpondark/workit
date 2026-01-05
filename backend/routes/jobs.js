const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
    getJobs,
    getJob,
    createJob,
    updateJob,
    deleteJob,
    getMyJobs,
    getJobApplications,
    submitWork,
    updateSubmission,
    completeJob,
    rejectSubmission,
    inviteFreelancer,
    getJobInvites,
    respondToInvite
} = require('../controllers/jobsController');

// @route   GET /api/jobs
// @desc    Get all jobs with filters
// @access  Public
router.get('/', getJobs);

// @route   GET /api/jobs/client/my-jobs
// @desc    Get all jobs posted by current client
// @access  Private (Client)
router.get('/client/my-jobs', protect, authorize('client'), getMyJobs);

// @route   GET /api/jobs/invites
// @desc    Get job invites for current freelancer
// @access  Private (Freelancer)
router.get('/invites', protect, authorize('freelancer'), getJobInvites);

// @route   GET /api/jobs/:id
// @desc    Get single job
// @access  Public
router.get('/:id', getJob);

// @route   POST /api/jobs
// @desc    Create a new job
// @access  Private (Client)
router.post('/', protect, authorize('client'), createJob);

// @route   PUT /api/jobs/:id
// @desc    Update a job
// @access  Private (Client - owner only)
router.put('/:id', protect, authorize('client'), updateJob);

// @route   DELETE /api/jobs/:id
// @desc    Delete a job
// @access  Private (Client - owner only)
router.delete('/:id', protect, authorize('client', 'admin'), deleteJob);

// @route   GET /api/jobs/:id/applications
// @desc    Get all applications for a job
// @access  Private (Client - owner only)
router.get('/:id/applications', protect, authorize('client'), getJobApplications);

// @route   POST /api/jobs/:id/submit
// @desc    Submit work for a job
// @access  Private (Freelancer - hired only)
router.post('/:id/submit', protect, authorize('freelancer'), submitWork);

// @route   PUT /api/jobs/:id/submit
// @desc    Update work submission for a job
// @access  Private (Freelancer - hired only)
router.put('/:id/submit', protect, authorize('freelancer'), updateSubmission);

// @route   POST /api/jobs/:id/complete
// @desc    Complete job and release payment
// @access  Private (Client - owner only)
router.post('/:id/complete', protect, authorize('client'), completeJob);

// @route   POST /api/jobs/:id/reject
// @desc    Reject work submission
// @access  Private (Client - owner only)
router.post('/:id/reject', protect, authorize('client'), rejectSubmission);

// @route   POST /api/jobs/:id/invite
// @desc    Invite freelancer to a job
// @access  Private (Client - job owner only)
router.post('/:id/invite', protect, authorize('client'), inviteFreelancer);

// @route   PUT /api/jobs/:id/invite/:inviteId
// @desc    Respond to job invite
// @access  Private (Freelancer)
router.put('/:id/invite/:inviteId', protect, authorize('freelancer'), respondToInvite);

module.exports = router;
