const mongoose = require('mongoose');

const quizAttemptSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },
    skill: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Skill',
        required: true
    },
    questions: [{
        question: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Question'
        },
        selectedOption: Number,
        isCorrect: Boolean
    }],
    score: {
        type: Number,
        required: true,
        min: 0,
        max: 10
    },
    totalQuestions: {
        type: Number,
        default: 10
    },
    passed: {
        type: Boolean,
        required: true
    },
    passToken: {
        type: String,
        unique: true,
        sparse: true
    },
    passTokenUsed: {
        type: Boolean,
        default: false
    },
    passTokenExpiresAt: Date,
    timeTaken: {
        type: Number, // in seconds
        default: 0
    },
    ipAddress: String,
    userAgent: String
}, {
    timestamps: true
});

// Index for efficient querying
quizAttemptSchema.index({ email: 1, skill: 1, createdAt: -1 });

module.exports = mongoose.model('QuizAttempt', quizAttemptSchema);
