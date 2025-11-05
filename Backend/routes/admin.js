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

// Get review summary for admin (admin only)
router.get('/reviews/summary', verifyToken, roleCheck(['admin']), async (req, res) => {
  try {
    const reviews = await Review.find({});

    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews : 0;

    // Group by rating
    const ratingCounts = reviews.reduce((acc, r) => {
      acc[r.rating] = (acc[r.rating] || 0) + 1;
      return acc;
    }, {});

    // Recent reviews (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentReviews = reviews.filter(r => r.createdAt >= thirtyDaysAgo);
    const recentAverageRating = recentReviews.length > 0 ? recentReviews.reduce((sum, r) => sum + r.rating, 0) / recentReviews.length : 0;

    res.json({
      success: true,
      data: {
        totalReviews,
        averageRating: Math.round(averageRating * 10) / 10,
        ratingCounts,
        recentReviewsCount: recentReviews.length,
        recentAverageRating: Math.round(recentAverageRating * 10) / 10
      }
    });
  } catch (error) {
    console.error('Get review summary error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
