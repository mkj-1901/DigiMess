const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

async function seedUsers() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    // Seed Admin
    const existingAdmin = await User.findOne({ email: 'admin@digimess.com' });
    if (existingAdmin) {
      console.log('🔄 Admin user already exists, updating password...');
      existingAdmin.password = 'admin123'; // plain text (will be re-hashed)
      await existingAdmin.save();
    } else {
      await User.create({
        name: 'Admin',
        email: 'admin@digimess.com',
        password: 'admin123', // plain text (will be hashed automatically)
        role: 'admin'
      });
      console.log('✅ Admin user created successfully');
    }

    // Seed Student
    const existingStudent = await User.findOne({ email: 'student@digimess.com' });
    if (existingStudent) {
      console.log('🔄 Student user already exists, updating password...');
      existingStudent.password = 'student123'; // plain text (will be re-hashed)
      await existingStudent.save();
    } else {
      await User.create({
        name: 'Student',
        email: 'student@digimess.com',
        password: 'student123', // plain text (will be hashed automatically)
        role: 'student'
      });
      console.log('✅ Student user created successfully');
    }

    console.log('✅ All users seeded successfully');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding users:', err.message);
    process.exit(1);
  }
}

seedUsers();
