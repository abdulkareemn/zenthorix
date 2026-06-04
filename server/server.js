require('dotenv').config();

const cookieParser = require('cookie-parser');
const cors = require('cors');
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const connectDB = require('./config/db');
const adminExamRoutes = require('./routes/adminExamRoutes');
const adminStudentRoutes = require('./routes/adminStudentRoutes');
const authRoutes = require('./routes/authRoutes');
const codeRunnerRoutes = require('./routes/codeRunnerRoutes');
const examRoutes = require('./routes/examRoutes');

const app = express();
const port = process.env.PORT || 5000;
const clientOrigin = process.env.CLIENT_ORIGIN || 'http://127.0.0.1:5173';
const allowedOrigins = new Set([clientOrigin, 'http://localhost:4173', 'http://127.0.0.1:4173']);

const User = require('./models/User');

async function autoSeedAdmin() {
  try {
    const email = (process.env.ADMIN_EMAIL || 'admin@example.com').trim().toLowerCase();
    const password = process.env.ADMIN_PASSWORD || 'admin123';
    const name = process.env.ADMIN_NAME || 'Admin';

    const existing = await User.findOne({ email }).select('+password');
    if (existing) {
      existing.name = name;
      existing.password = password;
      existing.role = 'admin';
      existing.status = 'approved';
      await existing.save();
      console.log(`Auto-seeded admin updated: ${email}`);
    } else {
      await User.create({
        name,
        email,
        password,
        role: 'admin',
        status: 'approved',
        assignedExams: []
      });
      console.log(`Auto-seeded admin created: ${email}`);
    }
  } catch (error) {
    console.error('Failed to auto-seed admin:', error.message);
  }
}

connectDB().then(autoSeedAdmin);

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.has(origin)) return callback(null, true);
    return callback(null, false);
  },
  credentials: true
}));
app.use(express.json({ limit: '80mb' }));
app.use(cookieParser());

app.get('/api/health', (req, res) => {
  res.status(200).json({ ok: true, mongo: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' });
});

app.use('/api/auth', authRoutes);
app.use('/api/admin/exams', adminExamRoutes);
app.use('/api/admin/students', adminStudentRoutes);
app.use('/api/code', codeRunnerRoutes);
app.use('/api/exams', examRoutes);

const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  return res.sendFile(path.join(distPath, 'index.html'));
});

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ message: 'Internal server error' });
});

if (require.main === module) {
  app.listen(port, () => {
    console.log(`API server running on port ${port}`);
  });
}

module.exports = app;
