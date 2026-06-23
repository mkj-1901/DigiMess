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

    // Parse dates as UTC to avoid timezone mismatches with the client
    const parsedStart = new Date(startDate + 'T00:00:00Z');
    const parsedEnd = new Date(endDate + 'T00:00:00Z');

    // Ensure opt-out dates are from tomorrow onwards (can't opt out for today or past)
    const now = new Date();
    const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const tomorrowUTC = new Date(todayUTC);
    tomorrowUTC.setUTCDate(tomorrowUTC.getUTCDate() + 1);

    if (parsedStart < tomorrowUTC) {
      return res.status(400).json({ success: false, message: 'Opt-out start date must be from tomorrow onwards. You cannot opt out for today or past dates.' });
    }

    // Allow single-day opt-outs (startDate === endDate)
    if (parsedStart > parsedEnd) {
      return res.status(400).json({ success: false, message: 'Start date must be before or equal to end date' });
    }

    const optOut = new OptOut({
      user: req.user.id,
      startDate: parsedStart,
      endDate: parsedEnd,
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
