const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const refreshTokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  token: {
    type: String,
    required: true
  },
  expiresAt: {
    type: Date,
    required: true
  }
}, {
  timestamps: true
});

// Hash refresh token before saving
refreshTokenSchema.pre('save', async function (next) {
  if (!this.isModified('token')) return next();
  this.token = await bcrypt.hash(this.token, 10);
  next();
});

// Compare refresh token method
refreshTokenSchema.methods.compareToken = async function (candidateToken) {
  return bcrypt.compare(candidateToken, this.token);
};

// Index for expired tokens cleanup
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('RefreshToken', refreshTokenSchema);
