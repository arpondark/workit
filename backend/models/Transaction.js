const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['payment', 'withdrawal', 'commission', 'refund', 'bonus'],
        required: [true, 'Transaction type is required']
    },
    amount: {
        type: Number,
        required: [true, 'Amount is required'],
        min: 0
    },
    currency: {
        type: String,
        default: 'USD'
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'cancelled', 'refunded'],
        default: 'pending'
    },
    from: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    to: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    job: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job'
    },
    description: {
        type: String,
        default: ''
    },
    commission: {
        type: Number,
        default: 0
    },
    commissionRate: {
        type: Number,
        default: 0.01 // 1%
    },
    netAmount: {
        type: Number,
        default: 0
    },
    paymentMethod: {
        type: String,
        default: 'platform'
    },
    transactionId: {
        type: String,
        unique: true,
        sparse: true
    },
    metadata: {
        type: Map,
        of: String
    },
    completedAt: Date,
    failedAt: Date,
    failureReason: String
}, {
    timestamps: true
});

// Calculate commission and net amount before saving
transactionSchema.pre('save', function(next) {
    if (this.type === 'payment' && this.isModified('amount')) {
        this.commission = this.amount * this.commissionRate;
        this.netAmount = this.amount - this.commission;
    }
    next();
});

// Generate unique transaction ID
transactionSchema.pre('save', function(next) {
    if (!this.transactionId) {
        this.transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    }
    next();
});

module.exports = mongoose.model('Transaction', transactionSchema);
