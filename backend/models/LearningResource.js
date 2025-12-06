const mongoose = require('mongoose');

const learningResourceSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a title'],
        trim: true,
        maxlength: [200, 'Title cannot be more than 200 characters']
    },
    url: {
        type: String,
        required: [true, 'Please add a URL'],
        trim: true
    },
    description: {
        type: String,
        trim: true,
        maxlength: [500, 'Description cannot be more than 500 characters']
    },
    category: {
        type: String,
        enum: ['course', 'tutorial', 'documentation', 'video', 'article', 'other'],
        default: 'other'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('LearningResource', learningResourceSchema);
