const express = require('express');
const User = require('../models/User');
const MealAttendance = require('../models/MealAttendance');
const OptOut = require('../models/OptOut');
const Rebate = require('../models/Rebate');
const Review = require('../models/Review');
const { verifyToken, roleCheck } = require('../middleware/authMiddleware');

const router = express.Router();

// Get review summary for admin (admin only)
const { summarizeReviews } = require('../ml/summarizer');

router.get('/reviews/summary', verifyToken, roleCheck(['admin']), async (req, res) => {
  try {
    const reviews = await Review.find({})
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('user', 'name email');

    if (!reviews.length) {
      return res
        .status(404)
        .json({ success: false, data: { averageRating: 0, summaryText: 'No reviews found.' } });
    }

    const summary = await summarizeReviews(reviews);

    // Send with `data` key to match frontend expectations
    res.json({ success: true, data: summary });
  } catch (error) {
    console.error('Admin summary route error:', error);
    res
      .status(500)
      .json({ success: false, data: { averageRating: 0, summaryText: 'Error generating summary.' } });
  }
});

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

// Get all pending opt-outs for admin (admin only)
router.get('/optouts', verifyToken, roleCheck(['admin']), async (req, res) => {
  try {
    const optOuts = await OptOut.find({})
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: optOuts });
  } catch (error) {
    console.error('Get admin opt-outs error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get all pending rebates for admin (admin only)
router.get('/rebates', verifyToken, roleCheck(['admin']), async (req, res) => {
  try {
    const rebates = await Rebate.find({})
      .populate('user', 'name email')
      .sort({ calculatedAt: -1 });

    res.json({ success: true, data: rebates });
  } catch (error) {
    console.error('Get admin rebates error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get all reviews for admin (admin only)
router.get('/reviews', verifyToken, roleCheck(['admin']), async (req, res) => {
  try {
    const reviews = await Review.find({})
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: reviews });
  } catch (error) {
    console.error('Get admin reviews error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get recent attendance for admin (admin only)
router.get('/attendance', verifyToken, roleCheck(['admin']), async (req, res) => {
  try {
    const attendance = await MealAttendance.find({})
      .populate('user', 'name email')
      .sort({ date: -1 })
      .limit(50);

    res.json({ success: true, data: attendance });
  } catch (error) {
    console.error('Get admin attendance error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
