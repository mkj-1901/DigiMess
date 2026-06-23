const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const PasswordResetToken = require('../models/PasswordResetToken');
const { verifyToken } = require('../middleware/authMiddleware');

const router = express.Router();

// Google OAuth client
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Email transporter (configure with your email service)
const transporter = nodemailer.createTransport({
  service: 'gmail',
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
  const refreshTokenExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  // Save refresh token to DB
  const refreshTokenDoc = new RefreshToken({
    userId: user._id,
    token: refreshTokenValue,
    expiresAt: refreshTokenExpiresAt
  });
  await refreshTokenDoc.save();

  return { accessToken, refreshToken: refreshTokenValue };
};

// ─── Google OAuth Login ──────────────────────────────────────────────────────
router.post('/google', async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ success: false, message: 'Google credential is required' });
    }

    // Verify the Google ID token
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    const payload = ticket.getPayload();

    if (!payload || !payload.email) {
      return res.status(400).json({ success: false, message: 'Invalid Google token' });
    }

    const { sub: googleId, email, name, picture } = payload;

    // Find or create user
    let user = await User.findOne({ $or: [{ googleId }, { email }] });

    if (user) {
      // Link Google ID if user exists by email but hasn't linked Google yet
      if (!user.googleId) {
        user.googleId = googleId;
        user.avatar = picture || user.avatar;
        await user.save();
      }
    } else {
      // Create new user (defaults to student role)
      user = new User({
        name: name || email.split('@')[0],
        email,
        googleId,
        avatar: picture || '',
        role: 'student'
      });
      await user.save();
    }

    // Generate tokens
    const { accessToken, refreshToken } = await generateTokens(user);

    const userResponse = {
      id: user._id,
      email: user.email,
      role: user.role,
      name: user.name,
      avatar: user.avatar
    };

    res.json({
      success: true,
      user: userResponse,
      accessToken,
      refreshToken
    });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(401).json({ success: false, message: 'Google authentication failed' });
  }
});

// ─── Email/Password Login ────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    if (!user.password) {
      return res.status(401).json({ 
        success: false, 
        message: 'This account uses Google Sign-In. Please use the Google button to log in.' 
      });
    }

    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({ success: false, message: 'Invalid password' });
    }

    const { accessToken, refreshToken } = await generateTokens(user);

    const userResponse = {
      id: user._id,
      email: user.email,
      role: user.role,
      name: user.name,
      avatar: user.avatar
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

// ─── Register ────────────────────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { email, password, role, name } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const user = new User({ email, password, role, name });
    await user.save();

    const { accessToken, refreshToken } = await generateTokens(user);

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

// ─── Forgot Password (sends email) ──────────────────────────────────────────
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if user exists or not
      return res.json({ success: true, message: 'If an account with that email exists, a reset link has been sent.' });
    }

    // Delete any existing reset tokens for this user
    await PasswordResetToken.deleteMany({ userId: user._id });

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    const resetTokenDoc = new PasswordResetToken({
      userId: user._id,
      token: resetToken,
      expiresAt: resetTokenExpiresAt
    });
    await resetTokenDoc.save();

    const origin = req.get('Origin') || `${req.protocol}://${req.get('host')}`;
    const resetUrl = `${origin}/reset-password?token=${resetToken}`;

    // Send email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset - DigiMess',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #238548; margin: 0;">DigiMess</h1>
            <p style="color: #666; margin-top: 5px;">Mess Management System</p>
          </div>
          <h2 style="color: #333;">Password Reset Request</h2>
          <p>Hello <strong>${user.name}</strong>,</p>
          <p>You requested a password reset for your DigiMess account.</p>
          <p>Click the button below to reset your password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #238548; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Reset Password</a>
          </div>
          <p style="color: #666; font-size: 14px;">This link will expire in <strong>1 hour</strong>.</p>
          <p style="color: #666; font-size: 14px;">If you didn't request this reset, please ignore this email — your password will remain unchanged.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
          <p style="color: #999; font-size: 12px; text-align: center;">DigiMess Team</p>
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

// ─── Reset Password (validates token) ────────────────────────────────────────
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ success: false, message: 'Token and new password are required' });
    }

    const resetTokenDoc = await PasswordResetToken.findOne({ token });
    if (!resetTokenDoc) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
    }

    if (resetTokenDoc.expiresAt < new Date()) {
      await PasswordResetToken.deleteOne({ _id: resetTokenDoc._id });
      return res.status(400).json({ success: false, message: 'Reset token has expired' });
    }

    const user = await User.findById(resetTokenDoc.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.password = newPassword;
    await user.save();

    // Delete the used reset token
    await PasswordResetToken.deleteOne({ _id: resetTokenDoc._id });

    res.json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ─── Update Profile (protected) ─────────────────────────────────────────────
router.put('/update-profile', verifyToken, async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (password) user.password = password;

    await user.save();

    const userResponse = {
      id: user._id,
      email: user.email,
      role: user.role,
      name: user.name,
      avatar: user.avatar
    };

    res.json({ success: true, user: userResponse, message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ─── Get Current User Profile (protected) ───────────────────────────────────
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

// ─── Refresh Token ──────────────────────────────────────────────────────────
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ success: false, message: 'Refresh token required' });
    }

    const refreshTokenDocs = await RefreshToken.find({ expiresAt: { $gt: new Date() } });

    let matchedDoc = null;
    for (const doc of refreshTokenDocs) {
      const isMatch = await doc.compareToken(refreshToken);
      if (isMatch) {
        matchedDoc = doc;
        break;
      }
    }

    if (!matchedDoc) {
      return res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
    }

    const user = await User.findById(matchedDoc.userId);
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    // Delete old refresh token (rotation)
    await RefreshToken.deleteOne({ _id: matchedDoc._id });

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

// ─── Logout (protected) ─────────────────────────────────────────────────────
router.post('/logout', verifyToken, async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      const refreshTokenDocs = await RefreshToken.find({ userId: req.user.id });
      for (const doc of refreshTokenDocs) {
        const isMatch = await doc.compareToken(refreshToken);
        if (isMatch) {
          await RefreshToken.deleteOne({ _id: doc._id });
          break;
        }
      }
    }

    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;