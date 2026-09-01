const express = require('express');
const rateLimit = require('express-rate-limit');
const {
  adminLogin,
  managerLogin,
  getMe,
  logout
} = require('../controllers/authController');

const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

// Rate limiter for login endpoints — 10 attempts per 15 minutes per IP
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, error: 'Too many login attempts, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/admin/login', loginLimiter, adminLogin);
router.post('/manager/login', loginLimiter, managerLogin);
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);

module.exports = router;
