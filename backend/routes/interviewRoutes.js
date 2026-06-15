const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect } = require('../middleware/authMiddleware');
const { createInterviewSetup, getUserInterviews } = require('../controllers/interviewController');
const { startInterviewSession, submitAnswer, submitCodeReview } = require('../controllers/interviewRoomController');
const { endInterviewAndEvaluate, getUserAnalytics, getSessionDetails } = require('../controllers/interviewFeedbackController');

// Multer configuration for memory storage (buffer)
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  }
});

router.route('/')
  .get(protect, getUserInterviews);

router.route('/setup')
  .post(protect, upload.single('resume'), createInterviewSetup);

router.route('/analytics')
  .get(protect, getUserAnalytics);

router.route('/:id')
  .get(protect, getSessionDetails);

router.route('/:id/start')
  .post(protect, startInterviewSession);

router.route('/:id/answer')
  .post(protect, submitAnswer);

router.route('/:id/code-review')
  .post(protect, submitCodeReview);

router.route('/:id/end')
  .post(protect, endInterviewAndEvaluate);

module.exports = router;
