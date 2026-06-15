const express = require('express');
const router = express.Router();
const {
  getUserProfile,
  updateUserProfile,
  uploadResume
} = require('../controllers/userProfileController');
const { protect } = require('../middleware/authMiddleware');
const multer = require('multer');

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed!'), false);
    }
  }
});

router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

router.post('/resume', protect, upload.single('resume'), uploadResume);

module.exports = router;
