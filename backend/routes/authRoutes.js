const express = require('express');
const router = express.Router();
const {
  authUser,
  registerUser,
  getUserProfile,
  getGoogleClientId,
  googleAuth,
  forgotPassword,
  resetPassword,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', authUser);
router.get('/profile', protect, getUserProfile);

// Google OAuth routes
router.get('/google/client-id', getGoogleClientId);
router.post('/google', googleAuth);

// Password reset routes
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

module.exports = router;
