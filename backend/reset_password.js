const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

mongoose.connect('mongodb://localhost:27017/workit')
  .then(async () => {
    const client = await User.findOne({ email: 'arpon@gmail.com' });
    const freelancer = await User.findOne({ email: 'shazan@gmail.com' });
    
    if (client) {
      client.password = await bcrypt.hash('password123', 10);
      await client.save();
      console.log('Client password updated to "password123"');
    }
    
    if (freelancer) {
      freelancer.password = await bcrypt.hash('password123', 10);
      await freelancer.save();
      console.log('Freelancer password updated to "password123"');
    }
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });