const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Job title is required'],
        trim: true,
        maxlength: [200, 'Title cannot exceed 200 characters']
    },
    description: {
        type: String,
        required: [true, 'Job description is required'],
        maxlength: [5000, 'Description cannot exceed 5000 characters']
    },
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Client reference is required']
    },
    skill: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Skill',
        required: [true, 'Skill category is required']
    },
    budget: {
        min: {
            type: Number,
            required: [true, 'Minimum budget is required'],
            min: 0
        },
        max: {
            type: Number,
            required: [true, 'Maximum budget is required'],
            min: 0
        },
        type: {
            type: String,
            enum: ['fixed', 'hourly'],
            default: 'fixed'
        }
    },
    duration: {
        type: String,
        enum: ['less-than-week', '1-2-weeks', '2-4-weeks', '1-3-months', '3-6-months', 'more-than-6-months'],
        default: '1-2-weeks'
    },
    experienceLevel: {
        type: String,
        enum: ['entry', 'intermediate', 'expert'],
        default: 'intermediate'
    },
    status: {
        type: String,
        enum: ['open', 'in-progress', 'completed', 'cancelled', 'closed'],
        default: 'open'
    },
    requirements: [{
        type: String,
        trim: true
    }],
    attachments: [{
        name: String,
        url: String,
        type: String
    }],
    applicationsCount: {
        type: Number,
        default: 0
    },
    hiredFreelancer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    hiredAt: Date,
    completedAt: Date,
    deadline: Date,
    isActive: {
        type: Boolean,
        default: true
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'escrowed', 'released', 'refunded'],
        default: 'pending'
    },
    submission: {
        description: String,
        attachments: [{
            name: String,
            url: String
        }],
        submittedAt: Date,
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected']
        }
    },
    views: {
        type: Number,
        default: 0
    },
    invites: [{
        freelancer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        invitedAt: {
            type: Date,
            default: Date.now
        },
        status: {
            type: String,
            enum: ['pending', 'accepted', 'declined'],
            default: 'pending'
        },
        message: String
    }]
}, {
    timestamps: true
});

// Index for search
jobSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Job', jobSchema);
