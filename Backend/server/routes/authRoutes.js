const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');

const { registerUser, loginUser, logoutUser, getMe, changePassword } = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validate');
const { registerSchema, loginSchema } = require('../validators/authValidator');
const { changePasswordSchema } = require('../validators/passwordValidator');

// Stricter limiter for login (brute-force protection)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 10 : 50,
  message: { success: false, message: 'Too many login attempts. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Looser limiter for registration (still protect against spam signups)
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: process.env.NODE_ENV === 'production' ? 5 : 50,
  message: { success: false, message: 'Too many registration attempts. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/register', registerLimiter, validate(registerSchema), registerUser);
router.post('/login', loginLimiter, validate(loginSchema), loginUser);
router.post('/logout', protect, logoutUser);
router.get('/me', protect, getMe); // not rate-limited — requires valid session anyway
router.put('/change-password', protect, validate(changePasswordSchema), changePassword);

module.exports = router;