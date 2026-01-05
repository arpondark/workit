const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

mongoose.connect('mongodb://localhost:27017/workit')
  .then(async () => {
    const client = await User.findOne({ email: 'arpon@gmail.com' });
    const freelancer = await User.findOne({ email: 'shazan@gmail.com' });
    
    console.log('Client user:', client ? 'Found' : 'Not found');
    console.log('Freelancer user:', freelancer ? 'Found' : 'Not found');
    
    if (client) {
      console.log('Testing password123:', await bcrypt.compare('password123', client.password));
      console.log('Testing password:', await bcrypt.compare('password', client.password));
    }
    if (freelancer) {
      console.log('Testing password123 for freelancer:', await bcrypt.compare('password123', freelancer.password));
      console.log('Testing password for freelancer:', await bcrypt.compare('password', freelancer.password));
    }
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });