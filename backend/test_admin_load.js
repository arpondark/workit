try {
    require('./routes/admin');
    console.log('Admin route loaded successfully');
} catch (error) {
    console.log('Error message:', error.message);
    console.log('Error stack:', error.stack);
}
