const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const { verifyToken } = require('../middleware/authMiddleware');

const router = express.Router();

// Helper function to generate tokens
const generateTokens = async (user) => {
  // Access token (short-lived, 15 minutes)
  const accessToken = jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );

  // Refresh token (long-lived, 7 days)
  const refreshTokenValue = crypto.randomBytes(64).toString('hex');
  const refreshTokenExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  // Save refresh token to DB
  const refreshTokenDoc = new RefreshToken({
    userId: user._id,
    token: refreshTokenValue,
    expiresAt: refreshTokenExpiresAt
  });
  await refreshTokenDoc.save();

  return { accessToken, refreshToken: refreshTokenValue };
};

// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    // Check password
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({ success: false, message: 'Invalid password' });
    }

    // Generate tokens
    const { accessToken, refreshToken } = await generateTokens(user);

    // Return user data without password
    const userResponse = {
      id: user._id,
      email: user.email,
      role: user.role,
      name: user.name
    };

    res.json({
      success: true,
      user: userResponse,
      accessToken,
      refreshToken
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Register route (for seeding initial users)
router.post('/register', async (req, res) => {
  try {
    const { email, password, role, name } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // Create new user
    const user = new User({ email, password, role, name });
    await user.save();

    // Generate tokens for auto-login after signup
    const { accessToken, refreshToken } = await generateTokens(user);

    // Return user data without password
    const userResponse = {
      id: user._id,
      email: user.email,
      role: user.role,
      name: user.name
    };

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: userResponse,
      accessToken,
      refreshToken
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get current user profile (protected)
router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('attendanceHistory')
      .populate('optOuts')
      .populate('rebates')
      .populate('reviews')
      .select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Refresh token (not protected, uses refresh token from body)
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ success: false, message: 'Refresh token required' });
    }

    // Find refresh token in DB
    const refreshTokenDoc = await RefreshToken.findOne({ token: refreshToken });
    if (!refreshTokenDoc) {
      return res.status(401).json({ success: false, message: 'Invalid refresh token' });
    }

    // Check if expired
    if (refreshTokenDoc.expiresAt < new Date()) {
      await RefreshToken.deleteOne({ _id: refreshTokenDoc._id });
      return res.status(401).json({ success: false, message: 'Refresh token expired' });
    }

    // Get user
    const user = await User.findById(refreshTokenDoc.userId);
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    // Delete old refresh token (rotation)
    await RefreshToken.deleteOne({ _id: refreshTokenDoc._id });

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = await generateTokens(user);

    res.json({
      success: true,
      accessToken,
      refreshToken: newRefreshToken
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Logout route (protected)
router.post('/logout', verifyToken, async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      // Delete refresh token from DB
      await RefreshToken.deleteOne({ token: refreshToken });
    }

    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
