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
    getTransactions,
    getTransactionStats,
    getSettings,
    updateSettings,
    resetQuizAttempts,
    clearAllMessages,
    getWithdrawalRequests,
    approveWithdrawal,
    rejectWithdrawal
} = require('../controllers/adminController');

const {
    getLearningResources,
    createLearningResource,
    updateLearningResource,
    deleteLearningResource
} = require('../controllers/learningResourcesController');

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

// ==================== TRANSACTIONS ====================

// @route   GET /api/admin/transactions/stats
// @desc    Get transaction stats
// @access  Private (Admin)
router.get('/transactions/stats', adminOnly, getTransactionStats);

// @route   GET /api/admin/transactions
// @desc    Get all transactions
// @access  Private (Admin)
router.get('/transactions', adminOnly, getTransactions);

// ==================== SETTINGS ====================

// @route   GET /api/admin/settings
// @desc    Get all admin settings
// @access  Private (Admin)
router.get('/settings', adminOnly, getSettings);

// @route   PUT /api/admin/settings
// @desc    Update settings (bulk)
// @access  Private (Admin)
router.put('/settings', adminOnly, updateSettings);

// ==================== DANGER ZONE ====================

// @route   POST /api/admin/reset-quiz-attempts
// @desc    Reset all quiz attempts
// @access  Private (Admin)
router.post('/reset-quiz-attempts', adminOnly, resetQuizAttempts);

// @route   POST /api/admin/clear-messages
// @desc    Clear all messages
// @access  Private (Admin)
router.post('/clear-messages', adminOnly, clearAllMessages);

// ==================== LEARNING RESOURCES ====================

// @route   GET /api/admin/learning-resources
// @desc    Get all learning resources
// @access  Private (Admin)
router.get('/learning-resources', adminOnly, getLearningResources);

// @route   POST /api/admin/learning-resources
// @desc    Create a learning resource
// @access  Private (Admin)
router.post('/learning-resources', adminOnly, createLearningResource);

// @route   PUT /api/admin/learning-resources/:id
// @desc    Update a learning resource
// @access  Private (Admin)
router.put('/learning-resources/:id', adminOnly, updateLearningResource);

// @route   DELETE /api/admin/learning-resources/:id
// @desc    Delete a learning resource
// @access  Private (Admin)
router.delete('/learning-resources/:id', adminOnly, deleteLearningResource);

// ==================== WITHDRAWALS ====================

// @route   GET /api/admin/withdrawals
// @desc    Get all withdrawal requests
// @access  Private (Admin)
router.get('/withdrawals', adminOnly, getWithdrawalRequests);

// @route   PUT /api/admin/withdrawals/:id/approve
// @desc    Approve a withdrawal request
// @access  Private (Admin)
router.put('/withdrawals/:id/approve', adminOnly, approveWithdrawal);

// @route   PUT /api/admin/withdrawals/:id/reject
// @desc    Reject a withdrawal request
// @access  Private (Admin)
router.put('/withdrawals/:id/reject', adminOnly, rejectWithdrawal);

module.exports = router;
