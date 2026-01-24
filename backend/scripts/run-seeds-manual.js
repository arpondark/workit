require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const { runAllSeeds } = require('../seeds/seedData');

const run = async () => {
    try {
        console.log('Connecting to DB...');
        await connectDB();
        console.log('DB Connected. Running seeds...');
        await runAllSeeds();
        console.log('Seeding complete.');
        process.exit(0);
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
};

run();
