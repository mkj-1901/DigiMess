const express = require('express');
const User = require('../models/User');
const MealAttendance = require('../models/MealAttendance');
const OptOut = require('../models/OptOut');
const Rebate = require('../models/Rebate');
const Review = require('../models/Review');
const router = express.Router();

// Helper to club multiple attendance records for the same student on the same day
const clubAttendanceRecords = (records) => {
  const clubbedMap = new Map();
  for (const record of records) {
    const userId = record.user?._id?.toString() || record.user?.toString();
    const dateKey = new Date(record.date).toISOString().split('T')[0];
    const compositeKey = `${userId}_${dateKey}`;

    if (!clubbedMap.has(compositeKey)) {
      const recordCopy = record.toObject ? record.toObject() : { ...record };
      clubbedMap.set(compositeKey, recordCopy);
    } else {
      const existing = clubbedMap.get(compositeKey);
      existing.breakfast = existing.breakfast || record.breakfast || false;
      existing.lunch = existing.lunch || record.lunch || false;
      existing.dinner = existing.dinner || record.dinner || false;

      // Keep the most recent updatedAt/createdAt
      if (record.updatedAt && (!existing.updatedAt || new Date(record.updatedAt) > new Date(existing.updatedAt))) {
        existing.updatedAt = record.updatedAt;
      }
      if (record.createdAt && (!existing.createdAt || new Date(record.createdAt) > new Date(existing.createdAt))) {
        existing.createdAt = record.createdAt;
      }
    }
  }

  return Array.from(clubbedMap.values()).map(record => {
    record.totalMeals = (record.breakfast ? 1 : 0) + (record.lunch ? 1 : 0) + (record.dinner ? 1 : 0);
    return record;
  }).sort((a, b) => {
    // Sort by updatedAt desc (most recent first). Fall back to date desc if updatedAt is missing
    const timeA = a.updatedAt ? new Date(a.updatedAt).getTime() : (a.date ? new Date(a.date).getTime() : 0);
    const timeB = b.updatedAt ? new Date(b.updatedAt).getTime() : (b.date ? new Date(b.date).getTime() : 0);
    return timeB - timeA;
  });
};

// Get review summary for admin (admin only)
const { summarizeReviews } = require('../ml/summarizer');

router.get('/reviews/summary', async (req, res) => {
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
router.get('/stats', async (req, res) => {
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
router.get('/optouts', async (req, res) => {
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
router.get('/rebates', async (req, res) => {
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
router.get('/reviews', async (req, res) => {
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
router.get('/attendance', async (req, res) => {
  try {
    const attendance = await MealAttendance.find({})
      .populate('user', 'name email')
      .sort({ date: -1 });

    const clubbedAttendance = clubAttendanceRecords(attendance).slice(0, 50);

    res.json({ success: true, data: clubbedAttendance });
  } catch (error) {
    console.error('Get admin attendance error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
