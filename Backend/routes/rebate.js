const express = require('express');
const Rebate = require('../models/Rebate');
const MealAttendance = require('../models/MealAttendance');
const OptOut = require('../models/OptOut');
const { verifyToken, roleCheck } = require('../middleware/authMiddleware');

const router = express.Router();

// Calculate rebate for a user and month (student/admin)
router.get('/:userId/calculate', verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { monthYear } = req.query; // e.g., '2024-01'

    if (!monthYear) {
      return res.status(400).json({ success: false, message: 'monthYear query parameter is required' });
    }

    // Role check: students only own
    if (req.user.role === 'student' && userId !== req.user.id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const [year, month] = monthYear.split('-').map(Number);
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0); // Last day of month

    const totalDays = endOfMonth.getDate();

    // Get attended days: count unique dates with totalMeals > 0
    const attendedAggregation = await MealAttendance.aggregate([
      { $match: { 
        user: userId, 
        date: { $gte: startOfMonth, $lte: endOfMonth },
        totalMeals: { $gt: 0 }
      }},
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } } } },
      { $count: 'attendedDays' }
    ]);
    const attendedDays = attendedAggregation[0]?.attendedDays || 0;

    // Get opt-out days: sum (end - start + 1) for approved opt-outs overlapping month
    const optOuts = await OptOut.find({
      user: userId,
      approved: true,
      $or: [
        { startDate: { $lte: endOfMonth }, endDate: { $gte: startOfMonth } }
      ]
    });
    let optOutDays = 0;
    optOuts.forEach(opt => {
      const overlapStart = new Date(Math.max(opt.startDate, startOfMonth));
      const overlapEnd = new Date(Math.min(opt.endDate, endOfMonth));
      optOutDays += (overlapEnd - overlapStart) / (1000 * 60 * 60 * 24) + 1;
    });

    const missedDays = totalDays - attendedDays - optOutDays;
    const baseFee = 3000; // Default
    const dailyRate = baseFee / totalDays;
    const calculatedAmount = baseFee - (missedDays * dailyRate); // Rebate = base - missed cost

    // Check if rebate already exists for this month
    let rebate = await Rebate.findOne({ user: userId, monthYear });
    if (!rebate) {
      rebate = new Rebate({
        user: userId,
        monthYear,
        baseFee,
        totalDays,
        attendedDays,
        optOutDays,
        missedDays,
        calculatedAmount
      });
      await rebate.save();

      // Add to user's rebates
      const User = require('../models/User');
      await User.findByIdAndUpdate(userId, { $push: { rebates: rebate._id } });
    }

    res.json({ success: true, rebate });
  } catch (error) {
    console.error('Calculate rebate error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Approve rebate (admin only)
router.put('/:id/approve', verifyToken, roleCheck(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body; // status: 'approved', 'rejected'; notes optional

    const rebate = await Rebate.findById(id);

    if (!rebate) {
      return res.status(404).json({ success: false, message: 'Rebate not found' });
    }

    if (status) {
      rebate.status = status;
      if (status === 'approved' || status === 'rejected') {
        rebate.approvedAt = new Date();
      }
    }
    if (notes !== undefined) {
      rebate.adminNotes = notes; // Add adminNotes field if needed, but model has no field; assume add to schema later or use status
    }

    await rebate.save();

    res.json({ success: true, rebate });
  } catch (error) {
    console.error('Approve rebate error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get user's rebate history
router.get('/:userId', verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;

    // Role check
    if (req.user.role === 'student' && userId !== req.user.id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const rebates = await Rebate.find({ user: userId })
      .sort({ calculatedAt: -1 })
      .populate('user', 'name email');

    res.json({ success: true, rebates });
  } catch (error) {
    console.error('Get rebates error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get all rebates for admin (admin only)
router.get('/admin', verifyToken, roleCheck(['admin']), async (req, res) => {
  try {
    const rebates = await Rebate.find({})
      .populate('user', 'name email')
      .sort({ calculatedAt: -1 });

    res.json({ success: true, rebates });
  } catch (error) {
    console.error('Get admin rebates error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
