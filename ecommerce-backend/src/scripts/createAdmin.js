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

async function createAdmin() {
  try {
    await mongoose.connect('mongodb://localhost:27017/ecommerce');
    
    await User.deleteOne({ email: 'admin@ecommerce.com' });
    
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash('AdminPass2024!', salt);
    
    const admin = new User({
      email: 'admin@ecommerce.com',
      password: hashedPassword,
      firstName: 'System',
      lastName: 'Administrator',
      role: 'admin'
    });
    
    await admin.save();
    console.log('Admin user created successfully');
    console.log('Email: admin@ecommerce.com');
    console.log('Password: AdminPass2024!');
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
}

createAdmin();
