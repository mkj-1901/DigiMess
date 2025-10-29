const express = require('express');
const MealAttendance = require('../models/MealAttendance');
const { verifyToken, roleCheck } = require('../middleware/authMiddleware');

const router = express.Router();

// Log meal attendance (student only)
router.post('/attendance', verifyToken, roleCheck(['student']), async (req, res) => {
  try {
    const { date, breakfast, lunch, dinner } = req.body;

    // Validate date
    if (!date) {
      return res.status(400).json({ success: false, message: 'Date is required' });
    }

    // Check if attendance already logged for this date
    const existing = await MealAttendance.findOne({
      user: req.user.id,
      date: new Date(date).setHours(0, 0, 0, 0) // Normalize to start of day
    });

    if (existing) {
      return res.status(400).json({ success: false, message: 'Attendance already logged for this date' });
    }

    const attendance = new MealAttendance({
      user: req.user.id,
      date: new Date(date),
      breakfast: breakfast || false,
      lunch: lunch || false,
      dinner: dinner || false
    });

    await attendance.save();

    // Add to user's attendanceHistory
    const User = require('../models/User');
    await User.findByIdAndUpdate(req.user.id, { $push: { attendanceHistory: attendance._id } });

    res.status(201).json({ success: true, attendance });
  } catch (error) {
    console.error('Log attendance error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get attendance history
router.get('/:userId/history', verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { startDate, endDate } = req.query;

    // Students can only access their own history
    if (req.user.role === 'student' && userId !== req.user.id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    let query = { user: userId };

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const history = await MealAttendance.find(query)
      .sort({ date: -1 })
      .limit(30); // Last 30 days

    res.json({ success: true, history });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get recent attendance for admin (admin only)
router.get('/admin/recent', verifyToken, roleCheck(['admin']), async (req, res) => {
  try {
    const attendance = await MealAttendance.find({})
      .populate('user', 'name email')
      .sort({ date: -1 })
      .limit(50);

    res.json({ success: true, attendance });
  } catch (error) {
    console.error('Get admin recent attendance error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
