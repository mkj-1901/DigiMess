require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('MongoDB connected'))
.catch((err) => {
  console.error(' MongoDB connection error:', err.message);
  process.exit(1); // stop server if DB not connected
});

// Middleware
app.use(cors());
app.use(express.json());

// Routes
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

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
