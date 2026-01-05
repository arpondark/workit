const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect('mongodb://localhost:27017/workit')
  .then(async () => {
    const client = await User.findOne({ email: 'arpon@gmail.com' }).select('+password');
    
    console.log('Client user object:');
    console.log(JSON.stringify(client, null, 2));
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });