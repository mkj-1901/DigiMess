const express = require('express');
const Review = require('../models/Review');
const { verifyToken, roleCheck } = require('../middleware/authMiddleware');
const { summarizeReviews } = require('../ml/summarizer');

const router = express.Router();

// Submit review (student only)
router.post('/submit', verifyToken, roleCheck(['student']), async (req, res) => {
  try {
    const { mealDate, rating, comment } = req.body;

    if (!mealDate || !rating) {
      return res.status(400).json({ success: false, message: 'Meal date and rating are required' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
    }

    const review = new Review({
      user: req.user.id,
      mealDate: new Date(mealDate),
      rating,
      comment: comment || ''
    });

    await review.save();

    // Add to user's reviews
    const User = require('../models/User');
    await User.findByIdAndUpdate(req.user.id, { $push: { reviews: review._id } });

    res.status(201).json({ success: true, review });
  } catch (error) {
    console.error('Submit review error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get user's reviews
router.get('/:userId', verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;

    // Students can only access their own
    if (req.user.role === 'student' && userId !== req.user.id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const reviews = await Review.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate('user', 'name email');

    res.json({ success: true, reviews });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get all reviews for admin (admin only)
router.get('/admin', verifyToken, roleCheck(['admin']), async (req, res) => {
  try {
    const reviews = await Review.find({})
      .sort({ createdAt: -1 })
      .populate('user', 'name email');

    res.json({ success: true, reviews });
  } catch (error) {
    console.error('Get admin reviews error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Approve/reject review (admin only)
router.put('/:id/approve', verifyToken, roleCheck(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { approved } = req.body;

    const review = await Review.findById(id);

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    review.approved = approved !== undefined ? approved : review.approved;

    await review.save();

    res.json({ success: true, review });
  } catch (error) {
    console.error('Approve review error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});


// Summarize reviews by date or latest (admin only)
router.get('/summary', verifyToken, roleCheck(['admin']), async (req, res) => {
  try {
    const { date } = req.query;
    let reviews;

    if (date) {
      const selectedDate = new Date(date);
      reviews = await Review.find({
        mealDate: {
          $gte: new Date(selectedDate.setHours(0, 0, 0, 0)),
          $lt: new Date(selectedDate.setHours(23, 59, 59, 999))
        },
        approved: true
      }).populate('user', 'name email');
    } else {
      reviews = await Review.find({ approved: true })
        .sort({ createdAt: -1 })
        .limit(50)
        .populate('user', 'name email');
    }

    if (!reviews.length) {
      return res.status(404).json({ success: false, message: 'No reviews found.' });
    }

    const summary = await summarizeReviews(reviews);
    res.json({ success: true, summary });
  } catch (error) {
    console.error('Summarize reviews error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;