const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        maxlength: [100, 'Name cannot exceed 100 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters'],
        select: false
    },
    role: {
        type: String,
        enum: ['client', 'freelancer', 'admin'],
        default: 'client'
    },
    avatar: {
        type: String,
        default: ''
    },
    bio: {
        type: String,
        maxlength: [500, 'Bio cannot exceed 500 characters'],
        default: ''
    },
    skills: [{
        skill: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Skill'
        },
        quizScore: {
            type: Number,
            default: 0
        },
        passed: {
            type: Boolean,
            default: false
        },
        passedAt: Date
    }],
    hourlyRate: {
        type: Number,
        default: 0
    },
    totalEarnings: {
        type: Number,
        default: 0
    },
    availableBalance: {
        type: Number,
        default: 0
    },
    completedJobs: {
        type: Number,
        default: 0
    },
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    reviewCount: {
        type: Number,
        default: 0
    },
    isOnline: {
        type: Boolean,
        default: false
    },
    lastSeen: {
        type: Date,
        default: Date.now
    },
    isSuspended: {
        type: Boolean,
        default: false
    },
    suspendedAt: Date,
    suspendedReason: String,
    location: {
        type: String,
        default: ''
    },
    phone: {
        type: String,
        default: ''
    },
    website: {
        type: String,
        default: ''
    },
    socialLinks: {
        linkedin: String,
        github: String,
        twitter: String
    }
}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function() {
    if (!this.isModified('password')) {
        return;
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.comparePassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Get highest quiz score
userSchema.methods.getHighestQuizScore = function() {
    if (this.skills.length === 0) return 0;
    return Math.max(...this.skills.map(s => s.quizScore));
};

module.exports = mongoose.model('User', userSchema);
