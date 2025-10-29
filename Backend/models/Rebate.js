const mongoose = require('mongoose');

const rebateSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  monthYear: {
    type: String, // e.g., '2024-01'
    required: true
  },
  baseFee: {
    type: Number,
    required: true,
    default: 3000 // Assume default monthly fee in INR
  },
  totalDays: {
    type: Number,
    required: true,
    default: 30 // Assume 30-day month
  },
  attendedDays: {
    type: Number,
    default: 0
  },
  optOutDays: {
    type: Number,
    default: 0
  },
  missedDays: {
    type: Number,
    default: 0
  },
  calculatedAmount: {
    type: Number,
    default: 0 // e.g., baseFee * (attendedDays / totalDays)
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'paid'],
    default: 'pending'
  },
  calculatedAt: {
    type: Date,
    default: Date.now
  },
  approvedAt: {
    type: Date
  }
});

module.exports = mongoose.model('Rebate', rebateSchema);
