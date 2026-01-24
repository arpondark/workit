require('dotenv').config();
const connectDB = require('../config/db');
const { seedAdmin, seedQuestions } = require('./seedData');

const seedAdminAndQuestions = async () => {
    await connectDB();
    await seedAdmin();
    await seedQuestions();
    process.exit(0);
};

seedAdminAndQuestions();
