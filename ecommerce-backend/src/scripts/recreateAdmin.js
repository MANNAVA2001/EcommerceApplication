const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  role: { type: String, enum: ['admin', 'user'], default: 'user' }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

async function recreateAdmin() {
  try {
    await mongoose.connect('mongodb://localhost:27017/ecommerce');
    console.log('Connected to MongoDB');
    
    const deleteResult = await User.deleteOne({ email: 'admin@ecommerce.com' });
    console.log('Deleted existing admin user:', deleteResult.deletedCount > 0 ? 'SUCCESS' : 'NOT FOUND');
    
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash('AdminPass2024!', salt);
    
    const admin = new User({
      email: 'admin@ecommerce.com',
      password: hashedPassword,
      firstName: 'System',
      lastName: 'Administrator',
      role: 'admin'
    });
    
    const savedAdmin = await admin.save();
    console.log('Created new admin user:');
    console.log('Email:', savedAdmin.email);
    console.log('Role:', savedAdmin.role);
    console.log('ID:', savedAdmin._id);
    
    await mongoose.disconnect();
    console.log('Admin recreation completed successfully');
  } catch (error) {
    console.error('Error recreating admin:', error.message);
    process.exit(1);
  }
}

recreateAdmin();
