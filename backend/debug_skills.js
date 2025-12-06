require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Skill = require('./models/Skill');

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/workit');
        console.log('Connected to DB');

        // Find a freelancer
        const user = await User.findOne({ role: 'freelancer' });
        if (!user) {
            console.log('No freelancer found');
            process.exit();
        }

        console.log('User ID:', user._id);
        console.log('Raw Skills:', JSON.stringify(user.skills, null, 2));

        // Populate
        await user.populate('skills.skill', 'name icon');
        console.log('Populated Skills:', JSON.stringify(user.skills, null, 2));

        const badSkill = user.skills.find(s => !s.skill || typeof s.skill === 'string' || !s.skill.name);
        if (badSkill) {
            console.log('--- Bad Skill Analysis ---');
            console.log('Type of s.skill:', typeof badSkill.skill);
            console.log('Value of s.skill:', badSkill.skill);
            console.log('String representation of badSkill object:', `${badSkill}`);
            console.log('badSkill.toString():', badSkill.toString());
        }

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
};

run();
