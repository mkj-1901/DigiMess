const express = require('express');
const OptOut = require('../models/OptOut');
const { roleCheck } = require('../middleware/authMiddleware');

const router = express.Router();

// Submit opt-out request (student only)
router.post('/request', roleCheck(['student']), async (req, res) => {
  try {
    const { startDate, endDate, reason } = req.body;

    if (!startDate || !endDate || !reason) {
      return res.status(400).json({ success: false, message: 'Start date, end date, and reason are required' });
    }

    // Ensure opt-out dates are from tomorrow onwards (can't opt out for today or past)
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const tomorrowStart = new Date(todayStart);
    tomorrowStart.setDate(tomorrowStart.getDate() + 1);

    if (new Date(startDate) < tomorrowStart) {
      return res.status(400).json({ success: false, message: 'Opt-out start date must be from tomorrow onwards. You cannot opt out for today or past dates.' });
    }

    if (new Date(startDate) >= new Date(endDate)) {
      return res.status(400).json({ success: false, message: 'Start date must be before end date' });
    }

    const optOut = new OptOut({
      user: req.user.id,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      reason
    });

    await optOut.save();

    // Add to user's optOuts
    const User = require('../models/User');
    await User.findByIdAndUpdate(req.user.id, { $push: { optOuts: optOut._id } });

    res.status(201).json({ success: true, optOut });
  } catch (error) {
    console.error('Submit opt-out error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Approve/reject opt-out (admin only)
router.put('/:id/approve', roleCheck(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { approved, adminNotes } = req.body;

    const optOut = await OptOut.findById(id);

    if (!optOut) {
      return res.status(404).json({ success: false, message: 'Opt-out not found' });
    }

    optOut.approved = approved !== undefined ? approved : optOut.approved;
    if (adminNotes !== undefined) {
      optOut.adminNotes = adminNotes;
    }

    await optOut.save();

    res.json({ success: true, optOut });
  } catch (error) {
    console.error('Approve opt-out error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get user's opt-outs
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Students can only access their own
    if (req.user.role === 'student' && userId !== req.user.id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const optOuts = await OptOut.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate('user', 'name email');

    res.json({ success: true, optOuts });
  } catch (error) {
    console.error('Get opt-outs error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
