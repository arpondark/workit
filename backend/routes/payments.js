const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
    processPayment,
    withdrawFunds,
    getTransactions,
    getEarnings
} = require('../controllers/paymentsController');

// @route   POST /api/payments/pay
// @desc    Make a payment for a job (dummy payment)
// @access  Private (Client)
router.post('/pay', protect, authorize('client'), processPayment);

// @route   POST /api/payments/withdraw
// @desc    Withdraw funds (dummy withdrawal)
// @access  Private (Freelancer)
router.post('/withdraw', protect, authorize('freelancer'), withdrawFunds);

// @route   GET /api/payments/transactions
// @desc    Get user transactions
// @access  Private
router.get('/transactions', protect, getTransactions);

// @route   GET /api/payments/earnings
// @desc    Get user earnings summary
// @access  Private
router.get('/earnings', protect, getEarnings);

module.exports = router;
