const mongoose = require('mongoose');

const mealAttendanceSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  breakfast: {
    type: Boolean,
    default: false
  },
  lunch: {
    type: Boolean,
    default: false
  },
  dinner: {
    type: Boolean,
    default: false
  },
  totalMeals: {
    type: Number,
    default: 0
  }
});

// Pre-save hook to compute totalMeals
mealAttendanceSchema.pre('save', function(next) {
  if (this.isNew || this.isModified('breakfast', 'lunch', 'dinner')) {
    this.totalMeals = (this.breakfast ? 1 : 0) + (this.lunch ? 1 : 0) + (this.dinner ? 1 : 0);
  }
  next();
});

module.exports = mongoose.model('MealAttendance', mealAttendanceSchema);
