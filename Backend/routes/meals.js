const express = require('express');
const MealAttendance = require('../models/MealAttendance');
const { roleCheck } = require('../middleware/authMiddleware');

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

// Log meal attendance (student only)
router.post('/attendance', roleCheck(['student']), async (req, res) => {
  try {
    const { date, breakfast, lunch, dinner } = req.body;

    // Validate date
    if (!date) {
      return res.status(400).json({ success: false, message: 'Date is required' });
    }

    let targetDate;
    if (typeof date === 'string' && date.includes('-')) {
      const parts = date.split('-');
      targetDate = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2], 0, 0, 0, 0));
    } else {
      targetDate = new Date(date);
      targetDate.setUTCHours(0, 0, 0, 0);
    }

    // Check if attendance already logged for this date
    let attendance = await MealAttendance.findOne({
      user: req.user.id,
      date: targetDate
    });

    if (attendance) {
      // Club (OR) with existing record — once a meal is marked true, it stays true
      attendance.breakfast = attendance.breakfast || (breakfast || false);
      attendance.lunch = attendance.lunch || (lunch || false);
      attendance.dinner = attendance.dinner || (dinner || false);
      await attendance.save();
      return res.status(200).json({ success: true, attendance });
    }

    attendance = new MealAttendance({
      user: req.user.id,
      date: targetDate,
      breakfast: breakfast || false,
      lunch: lunch || false,
      dinner: dinner || false
    });

    await attendance.save();

    // Add to user's attendanceHistory (using $addToSet to avoid duplicates)
    const User = require('../models/User');
    await User.findByIdAndUpdate(req.user.id, { $addToSet: { attendanceHistory: attendance._id } });

    res.status(201).json({ success: true, attendance });
  } catch (error) {
    console.error('Log attendance error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get attendance history
router.get('/:userId/history', async (req, res) => {
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
      .sort({ date: -1 });

    const clubbedHistory = clubAttendanceRecords(history).slice(0, 30);

    res.json({ success: true, history: clubbedHistory });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get recent attendance for admin (admin only)
router.get('/admin/recent', roleCheck(['admin']), async (req, res) => {
  try {
    const attendance = await MealAttendance.find({})
      .populate('user', 'name email')
      .sort({ date: -1 });

    const clubbedAttendance = clubAttendanceRecords(attendance).slice(0, 50);

    res.json({ success: true, attendance: clubbedAttendance });
  } catch (error) {
    console.error('Get admin recent attendance error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
