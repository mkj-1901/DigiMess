const express = require('express');
const User = require('../models/User');
const MealAttendance = require('../models/MealAttendance');
const OptOut = require('../models/OptOut');
const Rebate = require('../models/Rebate');
const Review = require('../models/Review');
const { verifyToken, roleCheck } = require('../middleware/authMiddleware');

const router = express.Router();

// Get admin stats (admin only)
router.get('/stats', verifyToken, roleCheck(['admin']), async (req, res) => {
  try {
    // Total users
    const totalUsers = await User.countDocuments();

    // Active today: users with attendance logged today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const activeToday = await MealAttendance.distinct('user', {
      date: { $gte: today, $lt: tomorrow }
    }).then(users => users.length);

    // Pending requests: pending opt-outs + pending rebates + unapproved reviews
    const pendingOptOuts = await OptOut.countDocuments({ approved: false });
    const pendingRebates = await Rebate.countDocuments({ status: 'pending' });
    const pendingReviews = await Review.countDocuments({ approved: false });

    const pendingRequests = pendingOptOuts + pendingRebates + pendingReviews;

    res.json({
      success: true,
      stats: {
        totalUsers,
        activeToday,
        pendingRequests
      }
    });
  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
