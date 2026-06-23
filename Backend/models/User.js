const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String }, // Optional for Google OAuth users
  role: { type: String, enum: ['admin', 'student'], default: 'student' },
  googleId: { type: String, unique: true, sparse: true }, // Google OAuth ID
  avatar: { type: String, default: '' }, // Profile picture URL from Google
  attendanceHistory: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MealAttendance'
  }],
  optOuts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'OptOut'
  }],
  rebates: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Rebate'
  }],
  reviews: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Review'
  }]
});

// Hash password before saving (skip if no password set — Google OAuth users)
userSchema.pre('save', async function (next) {
  if (!this.password || !this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false; // Google OAuth users can't use password login
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
