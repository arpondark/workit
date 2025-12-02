const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    chat: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chat',
        required: [true, 'Chat reference is required']
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Sender reference is required']
    },
    content: {
        type: String,
        required: [true, 'Message content is required'],
        maxlength: [5000, 'Message cannot exceed 5000 characters']
    },
    type: {
        type: String,
        enum: ['text', 'image', 'file', 'system'],
        default: 'text'
    },
    attachments: [{
        name: String,
        url: String,
        type: String,
        size: Number
    }],
    isRead: {
        type: Boolean,
        default: false
    },
    readAt: Date,
    isDeleted: {
        type: Boolean,
        default: false
    },
    deletedAt: Date
}, {
    timestamps: true
});

// Index for efficient querying
messageSchema.index({ chat: 1, createdAt: -1 });

module.exports = mongoose.model('Message', messageSchema);
