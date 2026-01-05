const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

mongoose.connect('mongodb://localhost:27017/workit')
  .then(async () => {
    const client = await User.findOne({ email: 'arpon@gmail.com' }).select('+password');
    
    const passwords = ['password', 'password123', '123456', 'workit'];
    for (const pwd of passwords) {
      const match = await bcrypt.compare(pwd, client.password);
      console.log(`Password "${pwd}": ${match ? 'MATCH' : 'No match'}`);
    }
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });