const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Generate JWT token
const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    });
};

// Generate quiz pass token
const generateQuizPassToken = () => {
    return crypto.randomBytes(32).toString('hex');
};

// Verify quiz pass token
const verifyQuizPassToken = (token) => {
    // Token validation will be done against database
    return token && token.length === 64;
};

// Format currency
const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency
    }).format(amount);
};

// Calculate commission
const calculateCommission = (amount, rate = 0.01) => {
    const commission = amount * rate;
    const netAmount = amount - commission;
    return { commission, netAmount, grossAmount: amount };
};

// Paginate results
const paginate = (page = 1, limit = 10) => {
    const skip = (page - 1) * limit;
    return { skip, limit: parseInt(limit) };
};

// Build pagination response
const paginationResponse = (data, page, limit, total) => {
    const totalPages = Math.ceil(total / limit);
    return {
        data,
        pagination: {
            currentPage: parseInt(page),
            totalPages,
            totalItems: total,
            itemsPerPage: parseInt(limit),
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1
        }
    };
};

// Sanitize user object (remove sensitive fields)
const sanitizeUser = (user) => {
    const userObj = user.toObject ? user.toObject() : { ...user };
    delete userObj.password;
    return userObj;
};

module.exports = {
    generateToken,
    generateQuizPassToken,
    verifyQuizPassToken,
    formatCurrency,
    calculateCommission,
    paginate,
    paginationResponse,
    sanitizeUser
};
