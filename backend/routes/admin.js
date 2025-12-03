const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
    getDashboardStats,
    getSkills,
    createSkill,
    updateSkill,
    deleteSkill,
    getQuestions,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    getUsers,
    suspendUser,
    deleteUser,
    getQuizResults,
    getJobs,
    deleteJob,
    getCommissions,
    getSettings,
    updateSetting
} = require('../controllers/adminController');

// Middleware to ensure admin access
const adminOnly = [protect, authorize('admin')];

// ==================== DASHBOARD ====================

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard stats
// @access  Private (Admin)
router.get('/dashboard', adminOnly, getDashboardStats);

// ==================== SKILLS ====================

// @route   GET /api/admin/skills
// @desc    Get all skills
// @access  Private (Admin)
router.get('/skills', adminOnly, getSkills);

// @route   POST /api/admin/skills
// @desc    Create a skill
// @access  Private (Admin)
router.post('/skills', adminOnly, createSkill);

// @route   PUT /api/admin/skills/:id
// @desc    Update a skill
// @access  Private (Admin)
router.put('/skills/:id', adminOnly, updateSkill);

// @route   DELETE /api/admin/skills/:id
// @desc    Delete a skill
// @access  Private (Admin)
router.delete('/skills/:id', adminOnly, deleteSkill);

// ==================== QUESTIONS ====================

// @route   GET /api/admin/questions
// @desc    Get all questions
// @access  Private (Admin)
router.get('/questions', adminOnly, getQuestions);

// @route   POST /api/admin/questions
// @desc    Create a question
// @access  Private (Admin)
router.post('/questions', adminOnly, createQuestion);

// @route   PUT /api/admin/questions/:id
// @desc    Update a question
// @access  Private (Admin)
router.put('/questions/:id', adminOnly, updateQuestion);

// @route   DELETE /api/admin/questions/:id
// @desc    Delete a question
// @access  Private (Admin)
router.delete('/questions/:id', adminOnly, deleteQuestion);

// ==================== USERS ====================

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Private (Admin)
router.get('/users', adminOnly, getUsers);

// @route   PUT /api/admin/users/:id/suspend
// @desc    Suspend/unsuspend a user
// @access  Private (Admin)
router.put('/users/:id/suspend', adminOnly, suspendUser);

// @route   DELETE /api/admin/users/:id
// @desc    Delete a user
// @access  Private (Admin)
router.delete('/users/:id', adminOnly, deleteUser);

// ==================== QUIZ RESULTS ====================

// @route   GET /api/admin/quiz-results
// @desc    Get quiz results of all freelancers
// @access  Private (Admin)
router.get('/quiz-results', adminOnly, getQuizResults);

// ==================== JOBS ====================

// @route   GET /api/admin/jobs
// @desc    Get all jobs
// @access  Private (Admin)
router.get('/jobs', adminOnly, getJobs);

// @route   DELETE /api/admin/jobs/:id
// @desc    Delete a job
// @access  Private (Admin)
router.delete('/jobs/:id', adminOnly, deleteJob);

// ==================== COMMISSIONS ====================

// @route   GET /api/admin/commissions
// @desc    Get commission logs
// @access  Private (Admin)
router.get('/commissions', adminOnly, getCommissions);

// ==================== SETTINGS ====================

// @route   GET /api/admin/settings
// @desc    Get all admin settings
// @access  Private (Admin)
router.get('/settings', adminOnly, getSettings);

// @route   PUT /api/admin/settings/:key
// @desc    Update a setting
// @access  Private (Admin)
router.put('/settings/:key', adminOnly, updateSetting);

module.exports = router;
