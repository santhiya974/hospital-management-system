const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const errorHandler = require('./middlewares/errorHandler');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const patientRoutes = require('./routes/patientRoutes');

const app = express();

console.log("✅ authRoutes loaded");
// Security headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // allows Cloudinary images to load cross-origin
  })
);

// CORS — allow only the configured client origin, with credentials (cookies)
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((url) => url.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. Postman, server-to-server)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

// Rate limiting — protects auth routes from brute force
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: { success: false, message: 'Too many requests. Please try again later.' },
});
// app.use('/api/auth', authLimiter);

// Body & cookie parsing
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());
app.use(mongoSanitize()); // strips $ and . from req.body/query/params to prevent NoSQL injection

// Logging (dev only)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'HMS API is running' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/doctor', doctorRoutes)
// Future: app.use('/api/admin', adminRoutes);
// Future: app.use('/api/doctor', doctorRoutes);
app.use('/api/patient', patientRoutes);
// app.use('/uploads', express.static(require('path').join(__dirname, 'uploads')));
// 404 handler for unknown routes
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Global error handler — must be last
app.use(errorHandler);

module.exports = app;
