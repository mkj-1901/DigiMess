const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const PasswordResetToken = require('../models/PasswordResetToken');
const { verifyToken } = require('../middleware/authMiddleware');

const router = express.Router();

// Email transporter (configure with your email service)
const transporter = nodemailer.createTransport({
  service: 'gmail', // or your email service
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

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

// Forgot password route
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if user exists or not for security
      return res.json({ success: true, message: 'If an account with that email exists, a reset link has been sent.' });
    }

    // Delete any existing reset tokens for this user
    await PasswordResetToken.deleteMany({ userId: user._id });

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Save reset token to DB
    const resetTokenDoc = new PasswordResetToken({
      userId: user._id,
      token: resetToken,
      expiresAt: resetTokenExpiresAt
    });
    await resetTokenDoc.save();

    // Send email
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset - DigiMess',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Password Reset Request</h2>
          <p>Hello ${user.name},</p>
          <p>You requested a password reset for your DigiMess account.</p>
          <p>Click the link below to reset your password:</p>
          <a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0;">Reset Password</a>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this reset, please ignore this email.</p>
          <p>Best regards,<br>DigiMess Team</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

    res.json({ success: true, message: 'If an account with that email exists, a reset link has been sent.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Reset password route
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    // Find reset token
    const resetTokenDoc = await PasswordResetToken.findOne({ token });
    if (!resetTokenDoc) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
    }

    // Check if expired
    if (resetTokenDoc.expiresAt < new Date()) {
      await PasswordResetToken.deleteOne({ _id: resetTokenDoc._id });
      return res.status(400).json({ success: false, message: 'Reset token has expired' });
    }

    // Find user
    const user = await User.findById(resetTokenDoc.userId);
    if (!user) {
      return res.status(400).json({ success: false, message: 'User not found' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    // Delete reset token
    await PasswordResetToken.deleteOne({ _id: resetTokenDoc._id });

    res.json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update profile route (protected)
router.put('/update-profile', verifyToken, async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const userId = req.user.id;

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Update fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (password) user.password = password;

    await user.save();

    // Return updated user data without password
    const userResponse = {
      id: user._id,
      email: user.email,
      role: user.role,
      name: user.name
    };

    res.json({ success: true, user: userResponse, message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Update profile error:', error);
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
