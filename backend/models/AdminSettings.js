const mongoose = require('mongoose');

const adminSettingsSchema = new mongoose.Schema({
    key: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    value: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    description: {
        type: String,
        default: ''
    },
    category: {
        type: String,
        enum: ['general', 'payment', 'quiz', 'notification', 'security'],
        default: 'general'
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('AdminSettings', adminSettingsSchema);
