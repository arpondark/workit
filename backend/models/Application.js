const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
    job: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
        required: [true, 'Job reference is required']
    },
    freelancer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Freelancer reference is required']
    },
    coverLetter: {
        type: String,
        required: [true, 'Cover letter is required'],
        maxlength: [2000, 'Cover letter cannot exceed 2000 characters']
    },
    proposedBudget: {
        type: Number,
        required: [true, 'Proposed budget is required'],
        min: 0
    },
    estimatedDuration: {
        type: String,
        required: [true, 'Estimated duration is required']
    },
    status: {
        type: String,
        enum: ['pending', 'shortlisted', 'accepted', 'rejected', 'withdrawn'],
        default: 'pending'
    },
    attachments: [{
        name: String,
        url: String,
        type: String
    }],
    clientNotes: {
        type: String,
        default: ''
    },
    acceptedAt: Date,
    rejectedAt: Date
}, {
    timestamps: true
});

// Prevent duplicate applications
applicationSchema.index({ job: 1, freelancer: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);
