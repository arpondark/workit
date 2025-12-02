const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Skill name is required'],
        unique: true,
        trim: true,
        maxlength: [100, 'Skill name cannot exceed 100 characters']
    },
    slug: {
        type: String,
        unique: true,
        lowercase: true
    },
    description: {
        type: String,
        maxlength: [500, 'Description cannot exceed 500 characters'],
        default: ''
    },
    icon: {
        type: String,
        default: '💼'
    },
    category: {
        type: String,
        enum: ['development', 'design', 'marketing', 'writing', 'video', 'music', 'business', 'media', 'other'],
        default: 'other'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    freelancerCount: {
        type: Number,
        default: 0
    },
    jobCount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Generate slug from name before saving
skillSchema.pre('save', function(next) {
    if (this.isModified('name')) {
        this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }
    next();
});

module.exports = mongoose.model('Skill', skillSchema);
