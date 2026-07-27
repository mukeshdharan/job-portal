const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { initDB } = require('./config/db');

// Import routes
const authRoutes = require('./routes/authRoutes');
const jobRoutes = require('./routes/jobRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const interviewRoutes = require('./routes/interviewRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const allowedOrigins = [
  'http://localhost:3000',
  'https://job-portal-ten-sooty.vercel.app',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'), false);
    }
  },
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files for resume uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/users', userRoutes);

// Basic health check route
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Job Portal backend is running.' });
});

// Database diagnostics route
app.get('/db-diagnostics', async (req, res) => {
  try {
    const { query } = require('./config/db');
    const result = await query.get('SELECT NOW()');
    const tables = await query.all(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    res.json({
      status: 'Connected',
      time: result?.now || null,
      tables: tables.map(t => t.table_name),
      env: {
        NODE_ENV: process.env.NODE_ENV,
        HAS_DATABASE_URL: !!process.env.DATABASE_URL,
        DATABASE_URL_CHAR_COUNT: process.env.DATABASE_URL?.length,
        DATABASE_URL_START: process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 15) : null
      }
    });
  } catch (err) {
    res.status(500).json({
      status: 'Connection Failed',
      error: err.message,
      stack: err.stack,
      env: {
        NODE_ENV: process.env.NODE_ENV,
        HAS_DATABASE_URL: !!process.env.DATABASE_URL,
        DATABASE_URL_CHAR_COUNT: process.env.DATABASE_URL?.length,
        DATABASE_URL_START: process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 15) : null
      }
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'An unexpected error occurred on the server.'
  });
});

// Initialize database then start server
initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode.`);
  });
}).catch(err => {
  console.error('Failed to initialize database:', err);
});
