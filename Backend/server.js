require('dotenv').config();

// Suppress ONNX Runtime C++ warnings before any imports
process.env.ORT_LOG_SEVERITY_LEVEL = '4';
process.env.ORT_LOG_LEVEL = 'fatal';

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 5000;

const autoSeed = require('./seed/autoSeed');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('🚀 MongoDB connected successfully');
    await autoSeed();
  })
  .catch((err) => {
    console.error('❌ MongoDB initial connection error:', err.message);
    process.exit(1); // stop server if DB not connected
  });

// Handle runtime database errors after initial connection
mongoose.connection.on('error', err => {
  console.error('⚠️ MongoDB runtime error:', err);
});

// ==========================================
// Middleware
// ==========================================
app.use(cors({
  origin: 'http://localhost:5173', // Restrict to your frontend application
  credentials: true                // Allows cookies/headers if you use them for sessions
}));
app.use(express.json());

// FIX: Manual Header to allow Cross-Origin popups (Google Auth, etc.)
app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  next();
});

// ==========================================
// Routes
// ==========================================
const authRoutes = require('./routes/auth');
const mealsRoutes = require('./routes/meals');
const optoutRoutes = require('./routes/optout');
const rebateRoutes = require('./routes/rebate');
const reviewsRoutes = require('./routes/reviews');
const adminRoutes = require('./routes/admin');
const { verifyToken, roleCheck } = require('./middleware/authMiddleware');

app.use('/api/auth', authRoutes);
app.use('/api/meals', verifyToken, mealsRoutes);
app.use('/api/optout', verifyToken, optoutRoutes);
app.use('/api/rebate', verifyToken, rebateRoutes);
app.use('/api/reviews', verifyToken, reviewsRoutes);
app.use('/api/admin', verifyToken, roleCheck(['admin']), adminRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.stack);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});

export default app;