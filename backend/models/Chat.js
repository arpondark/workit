const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }],
    job: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job'
    },
    lastMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message'
    },
    lastMessageAt: {
        type: Date,
        default: Date.now
    },
    unreadCount: {
        type: Map,
        of: Number,
        default: {}
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Ensure only 2 participants per chat (one-to-one)
chatSchema.pre('save', function(next) {
    if (this.participants.length !== 2) {
        next(new Error('Chat must have exactly 2 participants'));
    }
    next();
});

module.exports = mongoose.model('Chat', chatSchema);
