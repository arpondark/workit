const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    skill: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Skill',
        required: [true, 'Skill reference is required']
    },
    question: {
        type: String,
        required: [true, 'Question text is required'],
        trim: true,
        maxlength: [1000, 'Question cannot exceed 1000 characters']
    },
    options: [{
        text: {
            type: String,
            required: true,
            trim: true
        },
        isCorrect: {
            type: Boolean,
            default: false
        }
    }],
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        default: 'medium'
    },
    explanation: {
        type: String,
        default: ''
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Validate that at least one option is correct
questionSchema.pre('save', function (next) {
    const hasCorrectAnswer = this.options.some(opt => opt.isCorrect);
    if (!hasCorrectAnswer) {
        return next(new Error('Question must have at least one correct answer'));
    }
    if (this.options.length < 2) {
        return next(new Error('Question must have at least 2 options'));
    }
    next();
});

module.exports = mongoose.model('Question', questionSchema);
